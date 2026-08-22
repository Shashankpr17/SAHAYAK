from typing import List, Optional
from fastapi import APIRouter, File, UploadFile, Form, HTTPException, status
from app.services import storage_service

router = APIRouter(prefix="/api/documents", tags=["documents"])


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
        # Avoid duplicate processing if single file is identical to first element in list
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
