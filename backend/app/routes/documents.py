from pathlib import Path
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from fastapi import APIRouter, Request, File, UploadFile, Form, HTTPException, status
from app.services import storage_service, ocr_service

router = APIRouter(prefix="/api/documents", tags=["documents"])


class OCRRequest(BaseModel):
    file_ids: Optional[List[str]] = Field(default=None, description="List of file IDs to process with OCR")
    file_id: Optional[str] = Field(default=None, description="Single file ID to process with OCR")


@router.post(
    "/upload",
    status_code=status.HTTP_200_OK,
    summary="Upload document files",
    response_description="Files successfully uploaded and stored"
)
async def upload_document_endpoint(
    files: Optional[List[UploadFile]] = File(None),
    file: Optional[UploadFile] = File(None),
    document_type: Optional[str] = Form(None),
    document_subtype: Optional[str] = Form(None)
):
    """
    Handle single or multiple document uploads in multipart/form-data format.
    Accepts JPG, JPEG, PNG, and PDF files.
    """
    uploaded_files_list: List[UploadFile] = []

    if files:
        uploaded_files_list.extend(files)
    if file:
        if not files or file.filename != files[0].filename:
            uploaded_files_list.append(file)

    if not uploaded_files_list:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No files provided."
        )

    saved_metadata_list = []
    saved_filenames = []

    for f in uploaded_files_list:
        if not f.filename:
            continue

        try:
            content = await f.read()
            metadata = storage_service.save_uploaded_file(
                filename=f.filename,
                content_bytes=content,
                content_type=f.content_type
            )
            saved_metadata_list.append({
                "id": metadata["id"],
                "filename": metadata["filename"],
                "content_type": metadata["content_type"],
                "size": metadata["size"]
            })
            saved_filenames.append(metadata["filename"])
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to process uploaded file '{f.filename}': {str(e)}"
            )
        finally:
            await f.close()

    if not saved_metadata_list:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No valid files could be processed."
        )

    return {
        "success": True,
        "message": f"Successfully uploaded {len(saved_metadata_list)} documents",
        "files": saved_metadata_list,
        "filenames": saved_filenames,
        "document_type": document_type,
        "document_subtype": document_subtype
    }


@router.post(
    "/ocr",
    status_code=status.HTTP_200_OK,
    summary="Extract raw text from uploaded documents",
    response_description="Raw OCR/PDF extracted text per document"
)
async def ocr_documents_endpoint(request: Request):
    """
    Extract raw text from previously uploaded documents using file IDs,
    or directly from uploaded document files in multipart format.
    """
    content_type = request.headers.get("content-type", "").lower()
    file_ids_to_process: List[str] = []
    direct_files_to_process: List[tuple] = []  # (filename, bytes, content_type)

    if "application/json" in content_type:
        try:
            body = await request.json()
            if isinstance(body, dict):
                if "file_ids" in body and isinstance(body["file_ids"], list):
                    file_ids_to_process.extend(body["file_ids"])
                if "file_id" in body and body["file_id"] and body["file_id"] not in file_ids_to_process:
                    file_ids_to_process.append(body["file_id"])
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid JSON request body: {str(e)}"
            )
    elif "multipart/form-data" in content_type:
        try:
            form = await request.form()
            # Check for file_id / file_ids in form fields
            form_file_ids = form.getlist("file_ids")
            if form_file_ids:
                file_ids_to_process.extend(form_file_ids)
            form_single_id = form.get("file_id")
            if form_single_id and form_single_id not in file_ids_to_process:
                file_ids_to_process.append(str(form_single_id))

            # Check for direct files in form
            for key, val in form.items():
                if hasattr(val, "filename") and val.filename:
                    fbytes = await val.read()
                    direct_files_to_process.append((val.filename, fbytes, val.content_type))
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid multipart form request: {str(e)}"
            )

    documents_results = []
    all_extracted_texts = []

    # 1. Process File IDs from storage
    for fid in file_ids_to_process:
        meta = storage_service.get_file_metadata(fid)
        if not meta:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"File with ID '{fid}' not found."
            )
        file_path = Path(meta["stored_path"])
        if not file_path.exists():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Stored file '{meta['filename']}' is missing on disk."
            )

        with open(file_path, "rb") as f:
            content = f.read()

        extraction = ocr_service.extract_text_from_file_bytes(
            filename=meta["filename"],
            content_bytes=content,
            content_type=meta.get("content_type")
        )
        documents_results.append({
            "id": fid,
            "filename": meta["filename"],
            "text": extraction["raw_text"],
            "method": extraction["method"],
            "size": extraction["size"]
        })
        if extraction["raw_text"]:
            all_extracted_texts.append(extraction["raw_text"])

    # 2. Process direct uploaded files if provided
    for filename, content, mime in direct_files_to_process:
        saved_meta = storage_service.save_uploaded_file(
            filename=filename,
            content_bytes=content,
            content_type=mime
        )
        extraction = ocr_service.extract_text_from_file_bytes(
            filename=filename,
            content_bytes=content,
            content_type=mime
        )
        documents_results.append({
            "id": saved_meta["id"],
            "filename": filename,
            "text": extraction["raw_text"],
            "method": extraction["method"],
            "size": len(content)
        })
        if extraction["raw_text"]:
            all_extracted_texts.append(extraction["raw_text"])

    if not documents_results:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No valid file IDs or files provided for OCR."
        )

    aggregated_text = "\n\n=== Next Document ===\n\n".join(all_extracted_texts)

    return {
        "success": True,
        "documents": documents_results,
        "raw_text": aggregated_text
    }


@router.post(
    "/extract-text",
    status_code=status.HTTP_200_OK,
    summary="Extract text from single uploaded file directly",
    response_description="Raw OCR/PDF text"
)
async def extract_text_direct_endpoint(
    file: UploadFile = File(...)
):
    """
    Direct single file OCR / text extraction endpoint for client compatibility.
    """
    if not file or not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No file provided."
        )
    content = await file.read()
    extraction = ocr_service.extract_text_from_file_bytes(
        filename=file.filename,
        content_bytes=content,
        content_type=file.content_type
    )
    return {
        "success": True,
        "filename": file.filename,
        "raw_text": extraction["raw_text"],
        "method": extraction["method"]
    }
