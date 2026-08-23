"""
groq_service.py — OCR + Structured Extraction for SAHAYAK

Stage 1: Image bytes → Google Gemini Flash Vision → raw OCR text
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

def _get_groq_client():
    """Return a Groq client. Raises safe 500 if key is missing."""
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Extraction service is not configured. Contact admin."
        )
    try:
        from groq import Groq
        return Groq(api_key=api_key)
    except ImportError:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Extraction service library missing. Contact admin."
        )


def _get_gemini_client():
    """Return a configured Gemini GenerativeModel. Raises safe 500 if key missing."""
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="OCR service is not configured (missing GEMINI_API_KEY). Contact admin."
        )
    try:
        import google.generativeai as genai
        genai.configure(api_key=api_key)
        return genai.GenerativeModel("gemini-2.0-flash-lite")
    except ImportError:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="OCR service library missing. Contact admin."
        )


def _preprocess_image(image_bytes: bytes) -> bytes:
    """
    Correct orientation, convert to RGB JPEG.
    Returns original bytes on failure (graceful degradation).
    """
    try:
        from PIL import Image, ImageOps
        img = Image.open(io.BytesIO(image_bytes))
        img = ImageOps.exif_transpose(img)
        if img.mode not in ("RGB",):
            img = img.convert("RGB")
        buf = io.BytesIO()
        img.save(buf, format="JPEG", quality=92)
        return buf.getvalue()
    except Exception as e:
        print(f"[GROQ_SERVICE] Image preprocessing skipped: {e}")
        return image_bytes


# ---------------------------------------------------------------------------
# Stage 1 — Gemini Flash Vision → raw OCR text
# ---------------------------------------------------------------------------

_VISION_PROMPT = (
    "You are an expert OCR assistant specialising in Indian government documents "
    "(Aadhaar, PAN, Driving Licence, Voter ID, income certificates, ration cards, etc.).\n\n"
    "Transcribe ALL visible text from this document image EXACTLY as it appears — "
    "every character, label, number, date, and line. "
    "Preserve spacing, line breaks, and label-value pairs (e.g. 'Date of Birth: 01/01/1990'). "
    "Do NOT summarise, translate, interpret, or skip any text. "
    "Output ONLY the raw transcribed text, nothing else."
)


def extract_raw_text_from_image_bytes(
    image_bytes: bytes,
    mime_type: str = "image/jpeg",
    filename: str = "document"
) -> str:
    """
    Send image bytes to Gemini Flash Vision and return extracted raw OCR text.
    """
    if not image_bytes:
        raise ValueError(f"Image '{filename}' is empty.")

    processed = _preprocess_image(image_bytes)

    try:
        import google.generativeai as genai

        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="OCR service is not configured (missing GEMINI_API_KEY). Contact admin."
            )
        genai.configure(api_key=api_key)

        # Build inline image part
        image_part = {
            "inline_data": {
                "mime_type": "image/jpeg",
                "data": base64.b64encode(processed).decode("utf-8")
            }
        }

        print(f"[GROQ_SERVICE] Gemini Vision OCR: '{filename}' ({len(processed)} bytes)...")

        # Try active Gemini models in order of performance/availability
        candidate_models = ["gemini-2.5-flash", "gemini-3.5-flash-lite", "gemini-3.6-flash"]
        last_err = None
        raw_text = ""

        for m_name in candidate_models:
            try:
                model = genai.GenerativeModel(m_name)
                response = model.generate_content([_VISION_PROMPT, image_part])
                raw_text = response.text or ""
                print(f"[GROQ_SERVICE] Gemini ({m_name}) returned {len(raw_text)} chars for '{filename}'.")
                break
            except Exception as me:
                last_err = me
                print(f"[GROQ_SERVICE] Gemini model '{m_name}' attempt failed: {me}")

        if not raw_text and last_err:
            raise last_err

        return raw_text.strip()

    except HTTPException:
        raise
    except Exception as e:
        err_str = str(e)
        print(f"[GROQ_SERVICE] Gemini Vision failed for '{filename}': {err_str}")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"OCR failed for '{filename}'. Please ensure the image is clear and try again."
        )


# ---------------------------------------------------------------------------
# Stage 2 — Groq LLM → structured profile JSON
# ---------------------------------------------------------------------------

_EXTRACT_MODEL = "llama-3.3-70b-versatile"

_EXTRACT_SYSTEM = """You are an expert at extracting structured personal information from Indian government document OCR text.

You MUST follow these rules without exception:

1. OUTPUT: Return ONLY a single valid JSON object. No markdown fences, no explanation, no prose.
2. NULL: Use JSON null (not "null", not "N/A", not "Not available") when a field is genuinely absent.
3. NAMES: Extract the person's own full name only. Reject document titles, issuing authority names, government entity names, addresses, and occupations.
4. DOB: Extract ONLY the value explicitly labelled "Date of Birth", "DOB", "D.O.B", "Birth Date", "जन्म तिथि". NEVER pick the first date seen or an unlabelled date. Format as DD/MM/YYYY.
5. AADHAAR: Must be exactly 12 digits (may appear as 4-4-4 groups). Never confuse with VID (16 digits), phone (10 digits), or PIN (6 digits).
6. PAN: Format is exactly 5 uppercase letters + 4 digits + 1 uppercase letter (e.g. ABCDE1234F). Reject anything else.
7. DRIVING_LICENSE: Alphanumeric, typically starts with state code (e.g. KA01..., MH02...).
8. VOTER_ID: Alphanumeric, typically 3 letters + 7 digits (e.g. ABC1234567).
9. ADDRESS: Full address as printed on document. Preserve all lines.
10. STATE: Must be one of the 28 Indian states or 8 UTs. Normalize spelling to full English name.
11. DISTRICT: District name as printed.
12. CITY_LOCALITY: City, town, village, or locality name.
13. PIN_CODE: Exactly 6 digits. Never confuse with Aadhaar or phone numbers.
14. INCOME: Digits only (no currency symbols, no commas, no Rs/INR prefix).
15. GENDER: "Male", "Female", or "Transgender" only.
16. BLOOD_GROUP: One of A+, A-, B+, B-, O+, O-, AB+, AB-. Null if not present.
17. NEVER invent, guess, or hallucinate values. If unsure, use null.

Return exactly this JSON structure (no extra keys):
{
  "full_name": null,
  "date_of_birth": null,
  "gender": null,
  "father_name": null,
  "mother_name": null,
  "blood_group": null,
  "aadhaar_number": null,
  "pan_number": null,
  "driving_license_number": null,
  "voter_id_number": null,
  "address": null,
  "state": null,
  "district": null,
  "city_locality": null,
  "pin_code": null,
  "annual_income": null,
  "occupation": null
}"""


def _clean_json_response(text: str) -> str:
    """Strip markdown fences and whitespace from LLM output."""
    text = text.strip()
    # Remove ```json ... ``` or ``` ... ```
    text = re.sub(r"^```(?:json)?\s*", "", text, flags=re.IGNORECASE)
    text = re.sub(r"\s*```$", "", text)
    return text.strip()


def _merge_profiles(base: Dict[str, Any], new: Dict[str, Any]) -> Dict[str, Any]:
    """
    Merge two profile dicts.
    Never overwrites a valid (non-null, non-empty) base value with null/empty from new.
    Always fills null/empty base with valid values from new.
    """
    merged = dict(base)
    for key, new_val in new.items():
        existing = merged.get(key)
        # Only update if existing is absent AND new has a real value
        if new_val is not None and new_val != "" and (existing is None or existing == ""):
            merged[key] = new_val
    return merged


def _extract_json_from_llm(user_content: str) -> str:
    """Try Gemini 2.5 Flash first, then active Groq models as fallback."""
    # 1. Try Gemini 2.5 Flash
    gemini_key = os.getenv("GEMINI_API_KEY")
    if gemini_key:
        try:
            import google.generativeai as genai
            genai.configure(api_key=gemini_key)
            model = genai.GenerativeModel("gemini-2.5-flash")
            full_prompt = f"{_EXTRACT_SYSTEM}\n\n{user_content}"
            res = model.generate_content(
                full_prompt,
                generation_config={"response_mime_type": "application/json", "temperature": 0.0}
            )
            if res.text:
                return res.text.strip()
        except Exception as ge:
            print(f"[GROQ_SERVICE] Gemini JSON extraction attempt failed: {ge}")

    # 2. Try Groq with active models
    groq_key = os.getenv("GROQ_API_KEY")
    if groq_key:
        try:
            from groq import Groq
            client = Groq(api_key=groq_key)
            groq_models = ["qwen/qwen3.6-27b", "openai/gpt-oss-120b", "llama-3.3-70b-versatile"]
            for m in groq_models:
                try:
                    response = client.chat.completions.create(
                        model=m,
                        messages=[
                            {"role": "system", "content": _EXTRACT_SYSTEM},
                            {"role": "user", "content": user_content},
                        ],
                        temperature=0.0,
                        max_tokens=1024
                    )
                    raw = response.choices[0].message.content or ""
                    if raw:
                        return raw.strip()
                except Exception as me:
                    print(f"[GROQ_SERVICE] Groq model '{m}' extraction attempt failed: {me}")
        except Exception as e:
            print(f"[GROQ_SERVICE] Groq extraction failed: {e}")

    raise HTTPException(
        status_code=status.HTTP_502_BAD_GATEWAY,
        detail="Structured extraction service unavailable. Please check API keys."
    )


def extract_structured_fields_groq(
    raw_texts: List[str],
    document_type: Optional[str] = None
) -> Dict[str, Any]:
    """
    Given a list of raw OCR strings (one per document), extract structured
    profile fields using LLM, merging results across all documents.
    Returns canonical profile dict.
    """
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
            "Extract and return the JSON profile now."
        )

        print(f"[GROQ_SERVICE] Extracting fields from doc #{idx + 1} ({len(raw_text)} chars)...")
        try:
            raw_json = _extract_json_from_llm(user_content)
            cleaned = _clean_json_response(raw_json)
            parsed = json.loads(cleaned)

            # Keep only known keys; coerce empty strings → null
            doc_profile: Dict[str, Any] = {}
            for key in blank:
                val = parsed.get(key)
                if isinstance(val, str):
                    val = val.strip() or None
                doc_profile[key] = val

            merged = _merge_profiles(merged, doc_profile)
            print(f"[GROQ_SERVICE] Merged fields from doc #{idx + 1}.")

        except json.JSONDecodeError as e:
            print(f"[GROQ_SERVICE] JSON parse error doc #{idx + 1}: {e}.")
        except HTTPException:
            raise
        except Exception as e:
            print(f"[GROQ_SERVICE] Extraction failed doc #{idx + 1}: {e}")
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"Structured extraction failed: {str(e)}"
            )

    return merged
