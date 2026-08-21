"""
Groq LLM KYC Document Extractor
================================
Extracts structured details from Indian KYC documents (Aadhaar Card, PAN Card,
Driving License, Income Proof — salary slip / Form 16 / ITR, etc.) using a
Groq-hosted vision-capable LLM (qwen/qwen3.6-27b).

For each field, it fills whatever the document contains, and it is "smart"
about addresses: if the address text found on the document is missing the
district, state, or pincode, it tries to infer and back-fill those from
whatever IS present (e.g. deriving state from pincode, or pulling district/
state out of a longer address string using known Indian state names).

SETUP
-----
    pip install groq

    # NEVER hardcode your API key in source code. Set it as an env var:
    export GROQ_API_KEY="your_key_here"          # Linux / macOS
    setx GROQ_API_KEY "your_key_here"             # Windows (new shell after)

USAGE
-----
    python groq_kyc_extractor.py aadhaar.jpg pan.jpg dl.jpg salary_slip.pdf

    # or import and use programmatically:
    from groq_kyc_extractor import KYCExtractor
    extractor = KYCExtractor()
    result = extractor.process_documents(["aadhaar.jpg", "pan.jpg"])
"""

import os
import re
import sys
import json
import base64
import mimetypes
from typing import Optional

from groq import Groq

# --------------------------------------------------------------------------- #
# CONFIG
# --------------------------------------------------------------------------- #

MODEL_NAME = "qwen/qwen3.6-27b"          # Groq's current vision + JSON-mode model
MAX_TOKENS = 2048
TEMPERATURE = 0.1                         # low temperature -> consistent extraction

# --------------------------------------------------------------------------- #
# SYSTEM PROMPT
# --------------------------------------------------------------------------- #

SYSTEM_PROMPT = """You are a highly accurate KYC (Know Your Customer) document data-extraction
engine for Indian identity and income documents. You will be shown an image of ONE document,
which could be any of the following types:
  - Aadhaar Card (front or back)
  - PAN Card
  - Driving License (DL)
  - Income Proof (salary slip, Form 16, ITR acknowledgment, bank statement, etc.)
  - Any other government ID or financial proof

YOUR JOB:
1. First identify the document type.
2. Extract EVERY relevant field that is visibly present on the document. Do not guess or
   fabricate values that are not visible or cannot be reasonably inferred from what IS visible.
3. Return ONLY a single valid JSON object — no markdown, no code fences, no commentary.

Use exactly this JSON schema (use null for any field that is not applicable to this
document type or not visible/legible):

{
  "document_type": "aadhaar" | "pan" | "driving_license" | "income_proof" | "other",
  "document_type_confidence": "high" | "medium" | "low",
  "full_name": string or null,
  "father_or_husband_name": string or null,
  "date_of_birth": "DD-MM-YYYY" string or null,
  "gender": "Male" | "Female" | "Other" | null,
  "aadhaar_number": string or null (12 digits, format as 'XXXX XXXX XXXX' if visible),
  "pan_number": string or null (10-char alphanumeric, format AAAAA9999A),
  "driving_license_number": string or null,
  "dl_issue_date": "DD-MM-YYYY" string or null,
  "dl_valid_till": "DD-MM-YYYY" string or null,
  "dl_vehicle_classes": array of strings or null,
  "employer_name": string or null,
  "designation": string or null,
  "monthly_income": number or null,
  "annual_income": number or null,
  "income_document_period": string or null (e.g. "April 2025" or "FY 2024-25"),
  "raw_address_text": string or null (the FULL address exactly as printed, all lines joined),
  "address_line1": string or null (house/flat/street/locality — everything before district),
  "address_line2": string or null (any additional locality/landmark line, or null),
  "district": string or null,
  "state": string or null,
  "pincode": string or null (6-digit Indian PIN code),
  "phone_number": string or null,
  "email": string or null,
  "photo_present": true | false,
  "signature_present": true | false,
  "extraction_notes": string or null (mention any blur, cut-off text, or ambiguity)
}

SMART ADDRESS RULES (very important):
- Always populate "raw_address_text" with everything address-related exactly as printed,
  even if messy — do not lose information.
- Then produce a CLEANED, structured breakdown into address_line1 / address_line2 / district /
  state / pincode.
- Indian addresses often print district and state together, e.g. "Dist: Pune, Maharashtra" or
  "Pune, MH" or just embedded in a long comma-separated string. Parse these carefully:
    * A 6-digit number near the end of the address is almost always the PIN code — extract it
      into "pincode" even if not explicitly labeled "PIN" or "Pincode".
    * If a recognized Indian state name or standard abbreviation appears anywhere in the
      address (e.g. "Maharashtra", "MH", "U.P.", "Uttar Pradesh", "TN", "Tamil Nadu"), extract
      the full state name into "state".
    * The token(s) immediately before the state (often after "Dist.", "District", "Tehsil", or
      simply the second-to-last comma-separated segment) should be extracted into "district".
    * If the district is genuinely not printed anywhere and cannot be inferred from the visible
      text, leave "district" as null rather than guessing — but if a locality/city name is
      present that is well known to BE a district headquarters, you may use it and note this
      inference in "extraction_notes".
    * If state is missing but you can determine it confidently from context (e.g. a very
      well-known city/PIN prefix that leaves no ambiguity), fill it in and note the inference
      in "extraction_notes". Do not do this for ambiguous or low-confidence cases.
- Never invent a pincode, district, or state that has no supporting evidence in the image.

GENERAL RULES:
- Dates: always normalize to DD-MM-YYYY where the document allows.
- Numbers (Aadhaar/PAN/DL) should be transcribed exactly as printed, character for character.
- If the image is blurry, cropped, or a field is unreadable, set that field to null and explain
  briefly in "extraction_notes" — never guess sensitive ID numbers.
- Output MUST be valid JSON only. No prose before or after it.
"""

USER_PROMPT = (
    "Extract all details from this KYC document image following the schema and rules exactly. "
    "Return valid JSON only."
)

# --------------------------------------------------------------------------- #
# STATE / PINCODE HELPERS (offline smart fallback, no external API calls)
# --------------------------------------------------------------------------- #

INDIAN_STATES = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa",
    "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala",
    "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland",
    "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
    "Uttar Pradesh", "Uttarakhand", "West Bengal",
    "Andaman and Nicobar Islands", "Chandigarh",
    "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir",
    "Ladakh", "Lakshadweep", "Puducherry",
]

STATE_ABBREVIATIONS = {
    "AP": "Andhra Pradesh", "AR": "Arunachal Pradesh", "AS": "Assam", "BR": "Bihar",
    "CG": "Chhattisgarh", "CT": "Chhattisgarh", "GA": "Goa", "GJ": "Gujarat",
    "HR": "Haryana", "HP": "Himachal Pradesh", "JH": "Jharkhand", "JHR": "Jharkhand",
    "KA": "Karnataka", "KL": "Kerala", "MP": "Madhya Pradesh", "MH": "Maharashtra",
    "MN": "Manipur", "ML": "Meghalaya", "MZ": "Mizoram", "NL": "Nagaland",
    "OD": "Odisha", "OR": "Odisha", "PB": "Punjab", "RJ": "Rajasthan", "SK": "Sikkim",
    "TN": "Tamil Nadu", "TS": "Telangana", "TG": "Telangana", "TR": "Tripura",
    "UP": "Uttar Pradesh", "UK": "Uttarakhand", "UT": "Uttarakhand", "WB": "West Bengal",
    "AN": "Andaman and Nicobar Islands", "CH": "Chandigarh", "DN": "Dadra and Nagar Haveli and Daman and Diu",
    "DD": "Dadra and Nagar Haveli and Daman and Diu", "DL": "Delhi", "JK": "Jammu and Kashmir",
    "LA": "Ladakh", "LD": "Lakshadweep", "PY": "Puducherry",
}

# First digit of a 6-digit Indian PIN code -> broad postal zone -> candidate state list.
# Used only as a smart fallback hint, never to overwrite a confidently-extracted state.
PIN_ZONE_STATES = {
    "1": ["Delhi", "Haryana", "Punjab", "Himachal Pradesh", "Jammu and Kashmir", "Chandigarh", "Ladakh"],
    "2": ["Uttar Pradesh", "Uttarakhand"],
    "3": ["Rajasthan", "Gujarat", "Dadra and Nagar Haveli and Daman and Diu"],
    "4": ["Maharashtra", "Madhya Pradesh", "Chhattisgarh", "Goa"],
    "5": ["Andhra Pradesh", "Telangana", "Karnataka"],
    "6": ["Tamil Nadu", "Kerala", "Puducherry", "Lakshadweep"],
    "7": ["West Bengal", "Odisha", "Assam", "Arunachal Pradesh", "Manipur", "Meghalaya",
          "Mizoram", "Nagaland", "Tripura", "Sikkim", "Andaman and Nicobar Islands"],
    "8": ["Bihar", "Jharkhand"],
}

PINCODE_RE = re.compile(r"\b\d{6}\b")


def find_pincode(text: str) -> Optional[str]:
    """Pull a 6-digit PIN code out of free text, if present."""
    if not text:
        return None
    matches = PINCODE_RE.findall(text)
    return matches[-1] if matches else None  # last 6-digit number is usually the PIN


def find_state(text: str) -> Optional[str]:
    """Find a full Indian state name or abbreviation mentioned in free text."""
    if not text:
        return None
    upper_text = text.upper()
    for state in INDIAN_STATES:
        if state.upper() in upper_text:
            return state
    for abbr, full in STATE_ABBREVIATIONS.items():
        if re.search(rf"\b{abbr}\b", upper_text):
            return full
    return None


def guess_state_from_pincode(pincode: str) -> Optional[str]:
    """Very broad fallback: narrow candidate states by PIN zone. Only useful when a
    single state already matches from other context, so we just return the zone list;
    the caller decides whether it's a confident single match."""
    if not pincode or len(pincode) != 6 or not pincode.isdigit():
        return None
    zone = PIN_ZONE_STATES.get(pincode[0])
    if zone and len(zone) == 1:
        return zone[0]
    return None


def find_district(text: str, state: Optional[str]) -> Optional[str]:
    """Heuristic: look for 'Dist.'/'District'/'Tehsil' markers, or take the
    comma-separated segment immediately before the state name."""
    if not text:
        return None

    marker_match = re.search(
        r"(?:Dist\.?|District)\s*[:\-]?\s*([A-Za-z .]{3,40})", text, re.IGNORECASE
    )
    if marker_match:
        return marker_match.group(1).strip(" ,.-")

    if state:
        segments = [s.strip() for s in re.split(r"[,\n]", text) if s.strip()]
        for i, seg in enumerate(segments):
            if state.lower() in seg.lower() and i > 0:
                candidate = segments[i - 1]
                candidate = re.sub(r"\b\d{6}\b", "", candidate).strip(" ,.-")
                if candidate and not candidate.isdigit():
                    return candidate
    return None


def smart_fill_address(record: dict) -> dict:
    """Post-process an extracted record: if district/state/pincode are missing,
    try to recover them from raw_address_text using offline heuristics."""
    raw = record.get("raw_address_text") or ""
    combined_text = " ".join(
        filter(None, [raw, record.get("address_line1"), record.get("address_line2")])
    )

    if not record.get("pincode"):
        pin = find_pincode(combined_text)
        if pin:
            record["pincode"] = pin
            record.setdefault("extraction_notes", "")
            record["extraction_notes"] = (
                (record["extraction_notes"] or "") + " Pincode inferred from address text."
            ).strip()

    if not record.get("state"):
        state = find_state(combined_text)
        if not state and record.get("pincode"):
            state = guess_state_from_pincode(record["pincode"])
            if state:
                record.setdefault("extraction_notes", "")
                record["extraction_notes"] = (
                    (record["extraction_notes"] or "")
                    + " State inferred from PIN code zone (low confidence)."
                ).strip()
        if state:
            record["state"] = state

    if not record.get("district"):
        district = find_district(combined_text, record.get("state"))
        if district:
            record["district"] = district
            record.setdefault("extraction_notes", "")
            record["extraction_notes"] = (
                (record["extraction_notes"] or "") + " District inferred from address text."
            ).strip()

    return record


# --------------------------------------------------------------------------- #
# CORE EXTRACTOR
# --------------------------------------------------------------------------- #

class KYCExtractor:
    def __init__(self, api_key: Optional[str] = None):
        # Never hardcode the key. Pull it from the environment (or pass explicitly).
        key = api_key or os.environ.get("GROQ_API_KEY")
        if not key:
            raise RuntimeError(
                "GROQ_API_KEY not found. Set it with:\n"
                "  export GROQ_API_KEY='your_key_here'\n"
                "before running this script."
            )
        self.client = Groq(api_key=key)

    @staticmethod
    def _encode_image(image_path: str) -> str:
        mime_type, _ = mimetypes.guess_type(image_path)
        mime_type = mime_type or "image/jpeg"
        with open(image_path, "rb") as f:
            b64 = base64.b64encode(f.read()).decode("utf-8")
        return f"data:{mime_type};base64,{b64}"

    def extract_single_document(self, image_path: str) -> dict:
        """Send one document image to the Groq vision model and return the parsed,
        address-enriched JSON record."""
        data_url = self._encode_image(image_path)

        completion = self.client.chat.completions.create(
            model=MODEL_NAME,
            temperature=TEMPERATURE,
            max_completion_tokens=MAX_TOKENS,
            response_format={"type": "json_object"},
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": USER_PROMPT},
                        {"type": "image_url", "image_url": {"url": data_url}},
                    ],
                },
            ],
        )

        raw_output = completion.choices[0].message.content
        try:
            record = json.loads(raw_output)
        except json.JSONDecodeError:
            cleaned = re.sub(r"^```(?:json)?|```$", "", raw_output.strip(), flags=re.MULTILINE)
            record = json.loads(cleaned)

        record = smart_fill_address(record)
        record["_source_file"] = os.path.basename(image_path)
        return record

    def process_documents(self, image_paths: list) -> dict:
        """Process multiple documents and merge them into one consolidated KYC
        profile. Later documents fill in gaps but never overwrite a field that's
        already confidently populated."""
        per_document_results = []
        merged_profile: dict = {}

        for path in image_paths:
            try:
                record = self.extract_single_document(path)
            except Exception as exc:  # noqa: BLE001 - report and continue with other docs
                record = {"_source_file": os.path.basename(path), "error": str(exc)}
            per_document_results.append(record)

            if "error" in record:
                continue
            for field, value in record.items():
                if field.startswith("_"):
                    continue
                if value not in (None, "", [], {}) and not merged_profile.get(field):
                    merged_profile[field] = value

        return {
            "consolidated_profile": merged_profile,
            "per_document_extractions": per_document_results,
        }


# --------------------------------------------------------------------------- #
# CLI ENTRY POINT
# --------------------------------------------------------------------------- #

def main():
    if len(sys.argv) < 2:
        print("Usage: python groq_kyc_extractor.py <doc1.jpg> <doc2.png> ...")
        sys.exit(1)

    image_paths = sys.argv[1:]
    for p in image_paths:
        if not os.path.exists(p):
            print(f"File not found: {p}")
            sys.exit(1)

    extractor = KYCExtractor()
    result = extractor.process_documents(image_paths)

    output_json = json.dumps(result, indent=2, ensure_ascii=False)
    print(output_json)

    out_path = "kyc_extraction_result.json"
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(output_json)
    print(f"\nSaved full result to {out_path}")


if __name__ == "__main__":
    main()