import os
import uuid
import tempfile
from pathlib import Path
from typing import Dict, Any, List, Optional
from fastapi import HTTPException, status

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".pdf"}
MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024  # 15 MB

# Determine upload directory: support /tmp for serverless/Vercel and local storage fallback
DEFAULT_UPLOAD_DIR = Path(tempfile.gettempdir()) / "sahayak_uploads"
UPLOAD_DIR = Path(os.getenv("UPLOAD_DIR", str(DEFAULT_UPLOAD_DIR)))
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

# In-memory index of uploaded files metadata
_file_registry: Dict[str, Dict[str, Any]] = {}


def validate_file_extension(filename: str) -> str:
    """Validate that the file has an allowed extension."""
    if not filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File has no name."
        )
    ext = Path(filename).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file type '{ext}' for file '{filename}'. Allowed formats: JPG, JPEG, PNG, PDF."
        )
    return ext


def save_uploaded_file(filename: str, content_bytes: bytes, content_type: Optional[str] = None) -> Dict[str, Any]:
    """
    Validate, save file to temporary storage, and register metadata.
    """
    if len(content_bytes) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"The file '{filename}' is empty."
        )

    if len(content_bytes) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"The file '{filename}' exceeds the maximum allowed size of 15MB."
        )

    ext = validate_file_extension(filename)
    file_id = f"doc_{uuid.uuid4().hex[:12]}"
    safe_filename = Path(filename).name
    stored_name = f"{file_id}_{safe_filename}"
    file_path = UPLOAD_DIR / stored_name

    try:
        with open(file_path, "wb") as f:
            f.write(content_bytes)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to write file '{filename}' to storage: {str(e)}"
        )

    metadata = {
        "id": file_id,
        "filename": safe_filename,
        "content_type": content_type or "application/octet-stream",
        "size": len(content_bytes),
        "stored_name": stored_name,
        "stored_path": str(file_path)
    }

    _file_registry[file_id] = metadata
    return metadata


def get_file_metadata(file_id: str) -> Optional[Dict[str, Any]]:
    """Retrieve metadata for a stored file by ID."""
    return _file_registry.get(file_id)


def list_files() -> List[Dict[str, Any]]:
    """List all stored file metadata."""
    return list(_file_registry.values())
