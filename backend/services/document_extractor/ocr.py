import os
import io
import re
from pathlib import Path
from typing import Optional
from fastapi import APIRouter, File, UploadFile, Form, HTTPException, status, Header
from services.auth import verify_access_token
import pypdf
import easyocr
from PIL import Image, ImageOps, ImageEnhance, ImageFilter
import pytesseract

# Set Homebrew Tesseract binary path
tesseract_cmd = "/opt/homebrew/bin/tesseract"
if Path(tesseract_cmd).exists():
    pytesseract.pytesseract.tesseract_cmd = tesseract_cmd

router = APIRouter(prefix="/api/documents", tags=["documents"])

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".pdf"}

UPLOAD_DIR = Path(__file__).resolve().parent.parent.parent / "storage" / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

# Lazy-loaded EasyOCR reader singleton (kept for compatibility)
_ocr_reader: Optional[easyocr.Reader] = None


def get_ocr_reader() -> easyocr.Reader:
    global _ocr_reader
    if _ocr_reader is None:
        _ocr_reader = easyocr.Reader(['en'], gpu=False)
    return _ocr_reader


def preprocess_image_bytes(image_bytes: bytes) -> bytes:
    """Preprocess image bytes: orientation, grayscale, contrast, and sharpening."""
    try:
        img = Image.open(io.BytesIO(image_bytes))
        # 1. Correct rotation based on EXIF metadata
        img = ImageOps.exif_transpose(img)
        # 2. Convert to grayscale
        img = img.convert('L')
        # 3. Enhance contrast
        contrast = ImageEnhance.Contrast(img)
        img = contrast.enhance(1.8)
        # 4. Sharpen details
        img = img.filter(ImageFilter.SHARPEN)
        
        # Save to buffer
        buf = io.BytesIO()
        img.save(buf, format='JPEG', quality=95)
        return buf.getvalue()
    except Exception as e:
        print("[SAHAYAK OCR] Preprocessing skipped due to error:", e)
        return image_bytes


def mask_aadhaar_in_ocr_log(text: str) -> str:
    """Mask 12-digit Aadhaar numbers from developer logs for security."""
    if not text:
        return ""
    text = re.sub(r"\b\d{4}\s\d{4}\s\d{4}\b", "XXXX XXXX XXXX", text)
    text = re.sub(r"\b\d{12}\b", "XXXXXXXXXXXX", text)
    return text


def extract_text_from_image_bytes(image_bytes: bytes) -> str:
    """Run Tesseract OCR on raw image bytes (JPG, PNG, JPEG)."""
    try:
        print("[SAHAYAK OCR] OCR started")
        processed_bytes = preprocess_image_bytes(image_bytes)
        img = Image.open(io.BytesIO(processed_bytes))
        text = pytesseract.image_to_string(img)
        print("[SAHAYAK OCR] OCR completed")
        
        # Log parsed output securely
        secured_log = mask_aadhaar_in_ocr_log(text)
        print("[SAHAYAK OCR] Extracted text available:")
        print(secured_log)
        
        return text.strip()
    except Exception as e:
        raise ValueError(f"Image OCR processing failed: {str(e)}")


def extract_text_from_pdf_bytes(pdf_bytes: bytes) -> str:
    """Extract text from PDF (digital text first, fallback to image OCR for scanned pages)."""
    try:
        pdf_file = io.BytesIO(pdf_bytes)
        reader = pypdf.PdfReader(pdf_file)

        extracted_pages = []
        for page in reader.pages:
            page_text = page.extract_text() or ""
            page_text = page_text.strip()

            # If digital text exists, use it
            if len(page_text) > 10:
                extracted_pages.append(page_text)
            else:
                # Scanned page fallback: extract embedded page images and run OCR
                ocr_text_parts = []
                if hasattr(page, "images") and page.images:
                    for img in page.images:
                        try:
                            img_text = extract_text_from_image_bytes(img.data)
                            if img_text:
                                ocr_text_parts.append(img_text)
                        except Exception:
                            continue
                if ocr_text_parts:
                    extracted_pages.append("\n".join(ocr_text_parts))
                elif page_text:
                    extracted_pages.append(page_text)

        full_text = "\n\n".join(extracted_pages).strip()
        return full_text
    except Exception as e:
        raise ValueError(f"PDF text extraction failed: {str(e)}")


@router.post("/extract-text")
async def extract_text_endpoint(
    file: Optional[UploadFile] = File(None),
    filename: Optional[str] = Form(None),
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

    target_filename = ""
    content_type = ""
    file_bytes = b""

    user_upload_dir = UPLOAD_DIR / str(user_id)
    user_upload_dir.mkdir(parents=True, exist_ok=True)

    # 1. Handle file source: direct UploadFile OR existing stored file
    if file and file.filename:
        target_filename = file.filename
        content_type = file.content_type or "application/octet-stream"
        file_ext = Path(target_filename).suffix.lower()

        if file_ext not in ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unsupported file type '{file_ext}'. Allowed formats: JPG, JPEG, PNG, PDF.",
            )

        file_bytes = await file.read()
        await file.close()

        # Save to storage for consistency
        saved_path = user_upload_dir / target_filename
        with open(saved_path, "wb") as f:
            f.write(file_bytes)

    elif filename:
        target_filename = filename
        file_ext = Path(target_filename).suffix.lower()

        if file_ext not in ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unsupported file type '{file_ext}'. Allowed formats: JPG, JPEG, PNG, PDF.",
            )

        stored_file_path = user_upload_dir / target_filename
        if not stored_file_path.exists():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"File '{target_filename}' not found in storage. Please upload the file first.",
            )

        with open(stored_file_path, "rb") as f:
            file_bytes = f.read()

        if file_ext == ".pdf":
            content_type = "application/pdf"
        elif file_ext in [".jpg", ".jpeg"]:
            content_type = "image/jpeg"
        elif file_ext == ".png":
            content_type = "image/png"
        else:
            content_type = "application/octet-stream"
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No file uploaded or filename specified.",
        )

    # 2. Validate file size
    if not file_bytes or len(file_bytes) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The uploaded file is empty or corrupted.",
        )

    # 3. Process OCR / Text Extraction
    file_ext = Path(target_filename).suffix.lower()
    raw_text = ""

    try:
        if file_ext in [".jpg", ".jpeg", ".png"]:
            raw_text = extract_text_from_image_bytes(file_bytes)
        elif file_ext == ".pdf":
            raw_text = extract_text_from_pdf_bytes(file_bytes)
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unsupported file format '{file_ext}'.",
            )
    except ValueError as ve:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(ve),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"OCR extraction failed: {str(e)}",
        )

    if not raw_text.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No readable text could be extracted from the document.",
        )

    # 4. Return raw extracted text (NO structured fields)
    return {
        "success": True,
        "filename": target_filename,
        "content_type": content_type,
        "raw_text": raw_text
    }
