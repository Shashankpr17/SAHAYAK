"""
SAHAYAK Document AI — Centralized Gemini Client

Central configuration for the Gemini model used across the document
understanding pipeline. Change the MODEL_NAME constant here to switch
models for the entire application.

Security:
    - API key is read from the GEMINI_API_KEY environment variable only.
    - Never hardcoded, never exposed to frontend.
"""

import os
import json
import base64
from typing import Optional, Dict, Any

import google.generativeai as genai

# ═══════════════════════════════════════════════════════════════════════
# CENTRAL MODEL CONFIGURATION — Change this ONE constant to switch models
# ═══════════════════════════════════════════════════════════════════════
MODEL_NAME = "gemini-2.0-flash"

# Fallback model if the primary is unavailable
FALLBACK_MODEL_NAME = "gemini-1.5-flash"

# Request timeout in seconds
REQUEST_TIMEOUT = 60

# ═══════════════════════════════════════════════════════════════════════
# STRUCTURED OUTPUT SCHEMA — Comprehensive document extraction schema
# ═══════════════════════════════════════════════════════════════════════

EXTRACTION_PROMPT = """You are SAHAYAK Document Intelligence — an expert Indian government document analysis system.

TASK: Analyze the uploaded document image and extract ALL visible structured information.

STEP 1 — DOCUMENT IDENTIFICATION:
Determine the document type from the image content (NOT from the filename). Possible types:
- Aadhaar Card
- PAN Card
- Driving Licence
- Voter ID
- Passport
- Income Certificate
- Caste Certificate
- Other Government Document

STEP 2 — FIELD EXTRACTION:
Extract information ONLY when it is clearly visible and readable in the document image.
Do NOT guess, hallucinate, autocomplete, or invent any value.

STEP 3 — NAME EXTRACTION:
- Read the English name exactly as printed on the document.
- For Aadhaar: the name is typically above the DOB/gender line.
- For PAN: the name is the cardholder's name, NOT "INCOME TAX DEPARTMENT".
- Do not confuse document titles, authority names, or watermark text with the person's name.
- Do not translate Hindi/regional script names — extract the English version.

STEP 4 — DATE OF BIRTH (CRITICAL):
You MUST identify the correct Date of Birth using SEMANTIC ANALYSIS, not pattern matching.
- Look for explicit labels: "DOB", "Date of Birth", "Birth", "जन्म तिथि", "जन्म दिनांक"
- The DOB is the date DIRECTLY ASSOCIATED with one of these labels.
- IGNORE all other dates: Issue Date, Valid From, Valid Till, Expiry Date, Print Date, Registration Date, Application Date.
- For Driving Licence: There will be MULTIPLE dates. ONLY pick the one labelled "DOB" or "Date of Birth".
- Save which label you used in dateOfBirthLabel.
- If you cannot confidently identify the DOB, return empty string.

STEP 5 — ADDRESS INTELLIGENCE:
Extract the COMPLETE address as one string in fullAddress.
ALSO separately extract individual components:
- village/locality (the smallest geographical unit)
- city (town or city name)
- district (look for "District", "Dist", "Distt", "जिला" labels)
- state (Indian state name)
- pinCode (6-digit Indian PIN code)
- country (usually "India")

If the address contains embedded district/state/PIN information, extract them even without explicit labels.
Example: "Ward No 13, Bithsari, PO Bith, Begusarai, Bihar 851112"
→ district: "Begusarai", state: "Bihar", pinCode: "851112"

STEP 6 — IDENTITY NUMBERS:
- Aadhaar: Look for a 12-digit number (may be formatted as XXXX XXXX XXXX)
- PAN: Look for ABCDE1234F pattern (5 letters, 4 digits, 1 letter)
- Driving Licence: Usually state code + number format
- Voter ID: Usually 3 letters + 7 digits

STEP 7 — CONFIDENCE SCORING:
Rate your confidence for each extracted field from 0 to 100:
- 90-100: Clearly readable, unambiguous
- 70-89: Readable but slightly unclear
- 50-69: Partially visible or ambiguous
- 0-49: Very uncertain, possibly wrong

Return ONLY valid JSON. No markdown. No explanation text."""

# The response schema enforces structured output from Gemini
RESPONSE_SCHEMA = {
    "type": "OBJECT",
    "properties": {
        "documentType": {"type": "STRING"},
        "personal": {
            "type": "OBJECT",
            "properties": {
                "fullName": {"type": "STRING"},
                "dateOfBirth": {"type": "STRING"},
                "dateOfBirthLabel": {"type": "STRING"},
                "gender": {"type": "STRING"},
                "fatherName": {"type": "STRING"},
                "motherName": {"type": "STRING"},
                "bloodGroup": {"type": "STRING"},
            }
        },
        "identity": {
            "type": "OBJECT",
            "properties": {
                "aadhaarNumber": {"type": "STRING"},
                "panNumber": {"type": "STRING"},
                "drivingLicenceNumber": {"type": "STRING"},
                "voterIdNumber": {"type": "STRING"},
            }
        },
        "address": {
            "type": "OBJECT",
            "properties": {
                "fullAddress": {"type": "STRING"},
                "village": {"type": "STRING"},
                "locality": {"type": "STRING"},
                "city": {"type": "STRING"},
                "district": {"type": "STRING"},
                "state": {"type": "STRING"},
                "pinCode": {"type": "STRING"},
                "country": {"type": "STRING"},
            }
        },
        "additional": {
            "type": "OBJECT",
            "properties": {
                "annualIncome": {"type": "STRING"},
                "occupation": {"type": "STRING"},
            }
        },
        "confidence": {
            "type": "OBJECT",
            "properties": {
                "fullName": {"type": "INTEGER"},
                "dateOfBirth": {"type": "INTEGER"},
                "gender": {"type": "INTEGER"},
                "fatherName": {"type": "INTEGER"},
                "address": {"type": "INTEGER"},
                "state": {"type": "INTEGER"},
                "district": {"type": "INTEGER"},
                "pinCode": {"type": "INTEGER"},
                "aadhaarNumber": {"type": "INTEGER"},
                "panNumber": {"type": "INTEGER"},
                "drivingLicenceNumber": {"type": "INTEGER"},
                "voterIdNumber": {"type": "INTEGER"},
            }
        }
    }
}


def _configure_genai() -> bool:
    """Configure the Gemini SDK with the API key from environment. Returns True on success."""
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        print("[DOCUMENT AI] WARNING: GEMINI_API_KEY environment variable is not set.")
        return False
    genai.configure(api_key=api_key)
    return True


def _build_document_hint(document_subtype: Optional[str] = None) -> str:
    """Build an optional hint string about the expected document type."""
    if not document_subtype:
        return ""
    return f"\n\nHINT: The user indicated this may be a '{document_subtype}'. Use this as a hint but verify from the image content."


def extract_document_intelligence(
    file_bytes: bytes,
    mime_type: str,
    document_subtype: Optional[str] = None
) -> Optional[Dict[str, Any]]:
    """
    Send a document image to Gemini Vision and extract structured information.

    Args:
        file_bytes: Raw bytes of the document image/PDF.
        mime_type: MIME type (image/jpeg, image/png, application/pdf).
        document_subtype: Optional hint about expected document type.

    Returns:
        Parsed JSON dict from Gemini, or None on failure.
    """
    if not _configure_genai():
        return None

    print(f"[DOCUMENT AI] Starting Gemini extraction with model: {MODEL_NAME}")
    print(f"[DOCUMENT AI] Document size: {len(file_bytes)} bytes, MIME: {mime_type}")

    # Build the prompt with optional document type hint
    full_prompt = EXTRACTION_PROMPT + _build_document_hint(document_subtype)

    # Try primary model, then fallback
    for model_name in [MODEL_NAME, FALLBACK_MODEL_NAME]:
        try:
            model = genai.GenerativeModel(
                model_name=model_name,
                generation_config=genai.GenerationConfig(
                    response_mime_type="application/json",
                    response_schema=RESPONSE_SCHEMA,
                    temperature=0.1,  # Low temperature for factual extraction
                )
            )

            # Build the multimodal content
            response = model.generate_content(
                [
                    full_prompt,
                    {
                        "mime_type": mime_type,
                        "data": file_bytes,
                    }
                ],
                request_options={"timeout": REQUEST_TIMEOUT}
            )

            if response and response.text:
                try:
                    result = json.loads(response.text.strip())
                    print(f"[DOCUMENT AI] Gemini extraction completed successfully using {model_name}")
                    print(f"[DOCUMENT AI] Document type detected: {result.get('documentType', 'Unknown')}")
                    return result
                except json.JSONDecodeError as e:
                    print(f"[DOCUMENT AI] WARNING: Failed to parse Gemini JSON response: {e}")
                    print(f"[DOCUMENT AI] Raw response text: {response.text[:500]}")
                    
                    # Try to extract JSON from response if wrapped in markdown
                    import re
                    json_match = re.search(r'\{.*\}', response.text, re.DOTALL)
                    if json_match:
                        try:
                            result = json.loads(json_match.group())
                            print(f"[DOCUMENT AI] Recovered JSON from wrapped response")
                            return result
                        except json.JSONDecodeError:
                            pass
            else:
                print(f"[DOCUMENT AI] WARNING: Empty response from Gemini model {model_name}")

        except Exception as e:
            error_msg = str(e)
            print(f"[DOCUMENT AI] WARNING: Model {model_name} failed: {error_msg}")
            
            # If it's NOT a model-not-found error, don't try fallback
            if "not found" not in error_msg.lower() and "404" not in error_msg:
                break
            
            # Try fallback model
            if model_name == MODEL_NAME:
                print(f"[DOCUMENT AI] Trying fallback model: {FALLBACK_MODEL_NAME}")
                continue
            break

    print("[DOCUMENT AI] ERROR: All Gemini extraction attempts failed")
    return None
