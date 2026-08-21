import os
from pathlib import Path
from typing import List, Optional
from fastapi import APIRouter, File, UploadFile, Form, HTTPException, status, Header
from services.auth import verify_access_token

router = APIRouter(prefix="/api/documents", tags=["documents"])

# Allowed extensions and MIME content types
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".pdf"}
ALLOWED_CONTENT_TYPES = {
    "image/jpeg",
    "image/jpg",
    "image/png",
    "application/pdf",
}

# Storage directory inside backend/storage/uploads
UPLOAD_DIR = Path(__file__).resolve().parent.parent.parent / "storage" / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


@router.post("/upload")
async def upload_document(
    files: Optional[List[UploadFile]] = File(None),
    file: Optional[UploadFile] = File(None),
    document_type: Optional[str] = Form(None),
    document_subtype: Optional[str] = Form(None),
    authorization: Optional[str] = Header(None)
):
    user_id = 1
    if authorization:
        try:
            token = authorization.split(" ")[1]
            user_data = verify_access_token(token)
            if user_data and "user_id" in user_data:
                user_id = user_data["user_id"]
        except Exception:
            raise HTTPException(status_code=401, detail="Invalid authorization token")

    # Consolidate files from both parameters
    uploaded_filesList = []
    if files:
        uploaded_filesList.extend(files)
    if file:
        uploaded_filesList.append(file)

    if not uploaded_filesList:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No files provided.",
        )

    saved_filenames = []
    
    # Establish user-specific folder
    user_upload_dir = UPLOAD_DIR / str(user_id)
    user_upload_dir.mkdir(parents=True, exist_ok=True)
    
    for f in uploaded_filesList:
        if not f.filename:
            continue
            
        file_ext = Path(f.filename).suffix.lower()
        if file_ext not in ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unsupported file type '{file_ext}' in '{f.filename}'. Allowed formats: JPG, JPEG, PNG, PDF.",
            )

        try:
            content = await f.read()
            if len(content) == 0:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"The file '{f.filename}' is empty.",
                )

            saved_file_path = user_upload_dir / f.filename
            with open(saved_file_path, "wb") as dest:
                dest.write(content)

            saved_filenames.append(f.filename)
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to process uploaded file '{f.filename}': {str(e)}",
            )
        finally:
            await f.close()

    return {
        "success": True,
        "message": f"Successfully uploaded {len(saved_filenames)} documents",
        "filenames": saved_filenames,
        "document_type": document_type,
        "document_subtype": document_subtype
    }
