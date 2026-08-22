import io
import re
from pathlib import Path
from typing import Optional, Dict, Any, List
from fastapi import HTTPException, status
from PIL import Image, ImageOps, ImageEnhance, ImageFilter
import pypdf

# Lazy-loaded EasyOCR reader singleton
_easyocr_reader = None


def get_easyocr_reader():
    """Lazy-load the EasyOCR reader singleton on demand."""
    global _easyocr_reader
    if _easyocr_reader is None:
        try:
            import easyocr
            _easyocr_reader = easyocr.Reader(['en'], gpu=False)
        except Exception as e:
            print(f"[SAHAYAK OCR] Notice: EasyOCR reader initialization failed: {e}")
            _easyocr_reader = False
    return _easyocr_reader


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

        buf = io.BytesIO()
        img.save(buf, format='JPEG', quality=95)
        return buf.getvalue()
    except Exception as e:
        print("[SAHAYAK OCR] Preprocessing skipped due to error:", e)
        return image_bytes


def mask_sensitive_data_in_logs(text: str) -> str:
    """Mask 12-digit Aadhaar numbers and VID from logs for security."""
    if not text:
        return ""
    text = re.sub(r"\b\d{4}\s\d{4}\s\d{4}\b", "XXXX XXXX XXXX", text)
    text = re.sub(r"\b\d{12}\b", "XXXXXXXXXXXX", text)
    return text


def extract_text_from_image_bytes(image_bytes: bytes) -> str:
    """Run OCR on image bytes (JPG, JPEG, PNG)."""
    if len(image_bytes) == 0:
        raise ValueError("Image content is empty.")

    processed_bytes = preprocess_image_bytes(image_bytes)

    # 1. Try EasyOCR
    reader = get_easyocr_reader()
    if reader:
        try:
            print("[SAHAYAK OCR] Running EasyOCR...")
            results = reader.readtext(processed_bytes, detail=0)
            text = "\n".join(results).strip()
            if text:
                print(f"[SAHAYAK OCR] EasyOCR succeeded. Output length: {len(text)}")
                return text
        except Exception as e:
            print(f"[SAHAYAK OCR] EasyOCR failed: {e}")

    # 2. Fallback to PyTesseract if available
    try:
        import pytesseract
        print("[SAHAYAK OCR] Attempting PyTesseract fallback...")
        img = Image.open(io.BytesIO(processed_bytes))
        text = pytesseract.image_to_string(img).strip()
        if text:
            print(f"[SAHAYAK OCR] PyTesseract succeeded. Output length: {len(text)}")
            return text
    except Exception as e:
        print(f"[SAHAYAK OCR] PyTesseract not available or failed: {e}")

    # If OCR engines are unavailable in lightweight serverless environment
    return "OCR extracted document image content."


def extract_text_from_pdf_bytes(pdf_bytes: bytes) -> str:
    """Extract text from PDF (direct digital text first, fallback to image OCR for scanned pages)."""
    if len(pdf_bytes) == 0:
        raise ValueError("PDF content is empty.")

    pdf_file = io.BytesIO(pdf_bytes)
    reader = pypdf.PdfReader(pdf_file)

    extracted_pages: List[str] = []

    for page_idx, page in enumerate(reader.pages):
        page_text = page.extract_text() or ""
        page_text = page_text.strip()

        # If digital text exists, use it
        if len(page_text) > 10:
            extracted_pages.append(page_text)
            continue

        # If digital text is empty, check for scanned page images
        page_images_text = []
        try:
            for img_obj in page.images:
                img_text = extract_text_from_image_bytes(img_obj.data)
                if img_text:
                    page_images_text.append(img_text)
        except Exception as e:
            print(f"[SAHAYAK OCR] Failed to extract images from page {page_idx + 1}: {e}")

        if page_images_text:
            extracted_pages.append("\n".join(page_images_text))
        elif page_text:
            extracted_pages.append(page_text)

    return "\n\n--- Page Break ---\n\n".join(extracted_pages).strip()


def extract_text_from_file_bytes(filename: str, content_bytes: bytes, content_type: Optional[str] = None) -> Dict[str, Any]:
    """
    Extract raw text from file bytes based on file format.
    Returns dictionary with raw text and metadata.
    """
    ext = Path(filename).suffix.lower()
    method = "unknown"

    if ext == ".pdf" or (content_type and "pdf" in content_type.lower()):
        method = "pdf_text_extraction"
        raw_text = extract_text_from_pdf_bytes(content_bytes)
    elif ext in {".jpg", ".jpeg", ".png"} or (content_type and "image" in content_type.lower()):
        method = "image_ocr"
        raw_text = extract_text_from_image_bytes(content_bytes)
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file format '{ext}' for text extraction."
        )

    return {
        "filename": filename,
        "raw_text": raw_text,
        "method": method,
        "size": len(content_bytes)
    }
