"""
groq_service.py — Groq Vision OCR + Structured Extraction for SAHAYAK

Stage 1: Image/PDF page bytes → Groq Vision → raw OCR text
Stage 2: Raw OCR text → Groq LLM → canonical profile JSON
"""

import os
import io
import base64
import json
import re
from pathlib import Path
from typing import Optional, Dict, Any, List

from fastapi import HTTPException, status


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _get_client():
    """Return a Groq client, raising a safe 500 if the key is missing."""
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="OCR service is not configured (missing API key). Contact admin."
        )
    try:
        from groq import Groq
        return Groq(api_key=api_key)
    except ImportError:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="OCR service library is not installed. Contact admin."
        )


def _image_to_data_url(image_bytes: bytes, mime_type: str = "image/jpeg") -> str:
    """Encode raw image bytes as a base64 data URL for Groq Vision."""
    b64 = base64.b64encode(image_bytes).decode("utf-8")
    return f"data:{mime_type}; base64,{b64}"


def _preprocess_image(image_bytes: bytes) -> bytes:
    """
    Orientation-correct, convert to RGB JPEG.
    Returns original bytes on any failure (graceful degradation).
    """
    try:
        from PIL import Image, ImageOps
        img = Image.open(io.BytesIO(image_bytes))
        img = ImageOps.exif_transpose(img)
        if img.mode not in ("RGB", "L"):
            img = img.convert("RGB")
        buf = io.BytesIO()
        img.save(buf, format="JPEG", quality=92)
        return buf.getvalue()
    except Exception as e:
        print(f"[GROQ_SERVICE] Image preprocessing skipped: {e}")
        return image_bytes


# ---------------------------------------------------------------------------
# Stage 1 — Groq Vision -> raw OCR text
# ---------------------------------------------------------------------------

_VISION_MODEL = "meta-llama/llama-4-scout-17b-16e-instruct"

_VISION_PROMPT = (
    "You are an expert OCR assistant. Transcribe ALL visible text from this "
    "Indian government document image EXACTLY as it appears — every character, "
    "label, number, and line. Preserve spacing and line breaks. "
    "Do NOT summarize, explain, translate, or skip any text. "
    "Output ONLY the raw transcribed text, nothing else."
)


def extract_raw_text_from_image_bytes(
    image_bytes: bytes,
    mime_type: str = "image/jpeg",
    filename: str = "document"
) -> str:
    """
    Send image bytes to Groq Vision and return extracted raw text.
    Raises HTTPException on Groq API errors.
    """
    if not image_bytes:
        raise ValueError(f"Image '{filename}' is empty.")

    processed = _preprocess_image(image_bytes)
    data_url = _image_to_data_url(processed, "image/jpeg")

    client = _get_client()
    print(f"[GROQ_SERVICE] Calling Vision on '{filename}' ({len(processed)} bytes)...")

    try:
        response = client.chat.completions.create(
            model=_VISION_MODEL,
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": _VISION_PROMPT},
                        {"type": "image_url", "image_url": {"url": data_url}},
                    ],
                }
            ],
            temperature=0.0,
            max_tokens=4096,
        )
        raw_text = response.choices[0].message.content or ""
        print(f"[GROQ_SERVICE] Vision returned {len(raw_text)} chars for '{filename}'.")
        return raw_text.strip()
    except HTTPException:
        raise
    except Exception as e:
        err_str = str(e)
        print(f"[GROQ_SERVICE] Vision call failed for '{filename}': {err_str}")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Groq Vision OCR failed for '{filename}': {err_str}"
        )


# ---------------------------------------------------------------------------
# Stage 2 — Groq LLM -> structured profile JSON
# ---------------------------------------------------------------------------

_EXTRACT_MODEL = "llama-3.3-70b-versatile"

_EXTRACT_SYSTEM = """You are an expert at extracting structured personal information from Indian government document OCR text.

You MUST follow these rules without exception:

1. OUTPUT: Return ONLY a single valid JSON object. No markdown fences, no explanation, no prose.
2. NULL: Use JSON null (not "null", not "N/A", not "Not available") when a field is genuinely absent.
3. NAMES: Extract the person's own name only. Reject document titles, government names, addresses, occupations.
4. DOB: Use the value explicitly labelled "Date of Birth", "DOB", "D.O.B", "Birth Date". NEVER pick the first date seen. Format as DD/MM/YYYY.
5. AADHAAR: Must be exactly 12 digits. Never confuse with VID (16 digits), phone (10 digits), or PIN (6 digits).
6. PAN: Format is exactly AAAAA9999A (5 letters, 4 digits, 1 letter). Reject anything else.
7. ADDRESS: Full address as printed. Do NOT split into sub-fields unless they are explicitly labelled.
8. STATE: One of the 28 Indian states or 8 UTs. Normalize spelling.
9. INCOME: Numeric value only (digits and optional decimal). No currency symbols.
10. NEVER invent or guess values. If unsure, use null.

Return exactly this JSON structure (no extra keys):
{
  "full_name": string | null,
  "date_of_birth": string | null,
  "gender": string | null,
  "father_name": string | null,
  "mother_name": string | null,
  "blood_group": string | null,
  "aadhaar_number": string | null,
  "pan_number": string | null,
  "driving_license_number": string | null,
  "voter_id_number": string | null,
  "address": string | null,
  "state": string | null,
  "district": string | null,
  "city_locality": string | null,
  "pin_code": string | null,
  "annual_income": string | null,
  "occupation": string | null
}"""


def _clean_json_response(text: str) -> str:
    """Strip markdown fences and leading/trailing whitespace from LLM output."""
    text = text.strip()
    text = re.sub(r"^```(?:json)?\s*", "", text, flags=re.IGNORECASE)
    text = re.sub(r"\s*```$", "", text)
    return text.strip()


def _merge_profiles(base: Dict[str, Any], new: Dict[str, Any]) -> Dict[str, Any]:
    """
    Merge two extracted profile dicts.
    Rule: prefer non-null, non-empty values from 'new', but never overwrite
    a valid 'base' value with null/empty from 'new'.
    """
    merged = dict(base)
    for key, new_val in new.items():
        existing = merged.get(key)
        if new_val is not None and new_val != "" and (existing is None or existing == ""):
            merged[key] = new_val
    return merged


def extract_structured_fields_groq(
    raw_texts: List[str],
    document_type: Optional[str] = None
) -> Dict[str, Any]:
    """
    Given a list of raw OCR strings (one per document), call Groq LLM to
    extract structured profile fields, merging results across all documents.

    Returns canonical profile dict.
    """
    client = _get_client()

    blank: Dict[str, Any] = {
        "full_name": None, "date_of_birth": None, "gender": None,
        "father_name": None, "mother_name": None, "blood_group": None,
        "aadhaar_number": None, "pan_number": None,
        "driving_license_number": None, "voter_id_number": None,
        "address": None, "state": None, "district": None,
        "city_locality": None, "pin_code": None,
        "annual_income": None, "occupation": None
    }

    merged: Dict[str, Any] = dict(blank)

    for idx, raw_text in enumerate(raw_texts):
        if not raw_text or not raw_text.strip():
            print(f"[GROQ_SERVICE] Skipping empty OCR text for doc #{idx + 1}.")
            continue

        doc_hint = f"Document type hint: {document_type}.\n\n" if document_type else ""
        user_content = (
            f"{doc_hint}OCR TEXT:\n{raw_text}\n\n"
            "Extract and return the JSON profile."
        )

        print(f"[GROQ_SERVICE] Extracting fields from doc #{idx + 1} ({len(raw_text)} chars)...")
        try:
            response = client.chat.completions.create(
                model=_EXTRACT_MODEL,
                messages=[
                    {"role": "system", "content": _EXTRACT_SYSTEM},
                    {"role": "user", "content": user_content},
                ],
                temperature=0.0,
                max_tokens=1024,
                response_format={"type": "json_object"},
            )
            raw_json = response.choices[0].message.content or "{}"
            cleaned = _clean_json_response(raw_json)
            parsed = json.loads(cleaned)

            doc_profile: Dict[str, Any] = {}
            for key in blank:
                val = parsed.get(key)
                if isinstance(val, str):
                    val = val.strip() or None
                doc_profile[key] = val

            merged = _merge_profiles(merged, doc_profile)
            print(f"[GROQ_SERVICE] Fields merged from doc #{idx + 1}.")

        except json.JSONDecodeError as e:
            print(f"[GROQ_SERVICE] JSON parse error from doc #{idx + 1}: {e}.")
        except HTTPException:
            raise
        except Exception as e:
            print(f"[GROQ_SERVICE] Extraction call failed for doc #{idx + 1}: {e}")
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"Groq structured extraction failed: {str(e)}"
            )

    return merged
