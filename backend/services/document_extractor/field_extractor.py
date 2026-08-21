import re
import os
import base64
import urllib.request
import urllib.parse
from typing import Dict, Any, Optional, List
from pathlib import Path
import json
from fastapi import APIRouter, File, UploadFile, Form, HTTPException, status, Header
from services.auth import verify_access_token
from services.document_extractor.ocr import (
    ALLOWED_EXTENSIONS,
    UPLOAD_DIR,
    extract_text_from_image_bytes,
    extract_text_from_pdf_bytes,
)
from services.document_extractor.state_detector import detect_state_from_text

# NEW: Import the modular Document AI pipeline
try:
    from services.document_ai.document_extractor import extract_document_intelligence_pipeline as _ai_pipeline
    _AI_PIPELINE_AVAILABLE = True
except ImportError as _e:
    print(f"[SAHAYAK WARNING] Document AI pipeline not available: {_e}")
    _AI_PIPELINE_AVAILABLE = False

router = APIRouter(prefix="/api/documents", tags=["documents"])

# Shared profile storage location (backend/storage/profile.json)
STORAGE_DIR = Path(__file__).resolve().parent.parent.parent / "storage"
STORAGE_DIR.mkdir(parents=True, exist_ok=True)
PROFILE_FILE = STORAGE_DIR / "profile.json"

# List of Indian states & UTs for matching
INDIAN_STATES = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
    "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
    "Nagaland", "Odisha", "Orissa", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
    "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
    "Delhi", "New Delhi", "Chandigarh", "Puducherry", "Ladakh", "Jammu & Kashmir"
]

COMMON_OCCUPATIONS = [
    "Student", "Teacher", "Senior Teacher", "Farmer", "Agriculturist",
    "Engineer", "Doctor", "Government Employee", "Business", "Self Employed",
    "Worker", "Laborer", "Software Engineer", "Accountant"
]

PROHIBITED_NAME_KEYWORDS = {
    "government", "govt", "india", "bharat", "sarkar", "भारत", "सरकार",
    "unique", "identification", "authority", "uidai", "aadhaar", "aadhar",
    "date", "birth", "dob", "yob", "year", "male", "female", "transgender",
    "address", "residence", "enrollment", "help", "toll", "free", "vid",
    "number", "card", "identity", "signature", "thumb", "download", "issue",
    "father", "mother", "husband", "wife", "son", "daughter"
}


def is_valid_name_candidate(candidate: str) -> bool:
    """Validate whether a candidate string is a plausible person's name."""
    if not candidate:
        return False

    candidate = candidate.strip()
    
    # 1. Letters and spaces only (allowing dots for initials)
    if not re.match(r"^[A-Za-z\s\.]+$", candidate):
        return False

    # 2. Must not contain digits
    if re.search(r"\d", candidate):
        return False

    # 3. Minimum length
    if len(candidate) < 3 or len(candidate) > 50:
        return False

    # 4. Words split validation
    words = candidate.split()
    if len(words) < 2 or len(words) > 5:
        # A valid full name must contain at least 2 words (e.g. reject single junk words or overly long lines)
        return False

    # 5. Reject words that look like OCR noise or abbreviations
    for word in words:
        if len(word) < 2:
            if not word.endswith(".") and not word.endswith("-"):
                return False
                
        # Check prohibited keywords
        if word.lower() in PROHIBITED_NAME_KEYWORDS:
            return False
            
        # Reject abbreviations or uppercase verbs/words that are not names (e.g. GET, CET, CRT, ARS, PDF, DOC, IMG)
        if word.upper() in ["GET", "CET", "CRT", "ARS", "PDF", "DOC", "IMG", "DOB", "UID", "VID", "GOVT", "INDIA"]:
            return False
            
        # Check vowel presence in word (excluding initials like "S.")
        if len(word) >= 3 and not word.endswith("."):
            vowels = re.findall(r"[aeiouAEIOU]", word)
            if not vowels:
                return False

    return True


def is_valid_calendar_date(day: int, month: int, year: int) -> bool:
    """Validate whether day, month, and year represent a real, non-future calendar date."""
    if year < 1900 or year > 2026:
        return False
    if month < 1 or month > 12:
        return False
    
    # Days in month
    days_in_months = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
    # Leap year check
    if (year % 4 == 0 and year % 100 != 0) or (year % 400 == 0):
        days_in_months[1] = 29
        
    if day < 1 or day > days_in_months[month - 1]:
        return False
        
    return True


def extract_structured_data_via_gemini(file_bytes: bytes, mime_type: str) -> Optional[Dict[str, Any]]:
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        print("[SAHAYAK WARNING] GEMINI_API_KEY is not set.")
        return None
        
    print("[SAHAYAK] Gemini extraction started")
    b64_data = base64.b64encode(file_bytes).decode("utf-8")
    
    prompt = (
        "You are a high-accuracy Indian identity document information extraction system.\n\n"
        "Carefully inspect the uploaded document image directly.\n"
        "Identify the document type (e.g., Aadhaar Card, Driving Licence, PAN Card, Voter ID Card) and save it in 'documentType'.\n\n"
        "Do not invent, guess, hallucinate, autocomplete, or generate information.\n"
        "Extract information ONLY when it is clearly visible in the image.\n\n"
        "Document specific extraction guidelines:\n"
        "- AADHAAR CARD: Extract fullName, dateOfBirth, gender, aadhaarNumber, address, state, district, pinCode.\n"
        "- DRIVING LICENCE: Extract fullName, dateOfBirth, gender, fatherName (if explicitly present), address, state, drivingLicenceNumber, bloodGroup (if explicitly present).\n"
        "- PAN CARD: Extract fullName, fatherName, dateOfBirth, panNumber.\n"
        "- VOTER ID: Extract fullName, gender, fatherName (if present), dateOfBirth/age, voterIdNumber, address (if present).\n\n"
        "For names:\n"
        "- Read the English name exactly as printed.\n"
        "- Ignore OCR noise.\n"
        "- Do not translate or autocorrect the name.\n\n"
        "For Date of Birth, do not select a date merely because it matches a DD/MM/YYYY pattern.\n"
        "Locate the actual DOB field by visually finding labels such as:\n"
        "- DOB\n"
        "- Date of Birth\n"
        "- Birth\n"
        "- जन्म तिथि\n"
        "- जन्म तिथि / Date of Birth\n\n"
        "Extract only the date directly associated with one of these labels. "
        "Save the exact matching label in 'dateOfBirthLabel'.\n"
        "For Driving Licence specifically, prioritize explicit 'DOB' or 'Date of Birth' labels. "
        "Never confuse DOB with issue date, validity date, expiry date, print date, or other administrative dates.\n"
        "If multiple dates exist in the document, use the date that has the strongest semantic association with the DOB label.\n"
        "If the Date of Birth cannot be confidently identified or associated with one of these labels, return null.\n"
        "Never guess or infer a date.\n\n"
        "Return ONLY valid JSON in exactly this format:\n\n"
        "{\n"
        "  \"documentType\": null,\n"
        "  \"fullName\": null,\n"
        "  \"dateOfBirth\": null,\n"
        "  \"dateOfBirthLabel\": null,\n"
        "  \"dateOfBirthConfidence\": 0,\n"
        "  \"gender\": null,\n"
        "  \"fatherName\": null,\n"
        "  \"motherName\": null,\n"
        "  \"bloodGroup\": null,\n"
        "  \"aadhaarNumber\": null,\n"
        "  \"panNumber\": null,\n"
        "  \"drivingLicenceNumber\": null,\n"
        "  \"voterIdNumber\": null,\n"
        "  \"address\": null,\n"
        "  \"state\": null,\n"
        "  \"district\": null,\n"
        "  \"pinCode\": null,\n"
        "  \"annualIncome\": null,\n"
        "  \"occupation\": null,\n"
        "  \"confidence\": {\n"
        "    \"fullName\": 0,\n"
        "    \"dateOfBirth\": 0,\n"
        "    \"gender\": 0,\n"
        "    \"fatherName\": 0,\n"
        "    \"bloodGroup\": 0,\n"
        "    \"aadhaarNumber\": 0,\n"
        "    \"address\": 0\n"
        "  }\n"
        "}\n\n"
        "Confidence must be a number from 0 to 100.\n"
        "If a value is uncertain, return null instead of guessing."
    )
    
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
    
    payload = {
        "contents": [
            {
                "parts": [
                    {"text": prompt},
                    {
                        "inlineData": {
                            "mimeType": mime_type,
                            "data": b64_data
                        }
                    }
                ]
            }
        ],
        "generationConfig": {
            "responseMimeType": "application/json",
            "responseSchema": {
                "type": "OBJECT",
                "properties": {
                    "documentType": {"type": "STRING"},
                    "fullName": {"type": "STRING"},
                    "dateOfBirth": {"type": "STRING"},
                    "dateOfBirthLabel": {"type": "STRING"},
                    "dateOfBirthConfidence": {"type": "INTEGER"},
                    "gender": {"type": "STRING"},
                    "fatherName": {"type": "STRING"},
                    "motherName": {"type": "STRING"},
                    "bloodGroup": {"type": "STRING"},
                    "aadhaarNumber": {"type": "STRING"},
                    "panNumber": {"type": "STRING"},
                    "drivingLicenceNumber": {"type": "STRING"},
                    "voterIdNumber": {"type": "STRING"},
                    "address": {"type": "STRING"},
                    "state": {"type": "STRING"},
                    "district": {"type": "STRING"},
                    "pinCode": {"type": "STRING"},
                    "annualIncome": {"type": "STRING"},
                    "occupation": {"type": "STRING"},
                    "confidence": {
                        "type": "OBJECT",
                        "properties": {
                            "fullName": {"type": "INTEGER"},
                            "dateOfBirth": {"type": "INTEGER"},
                            "gender": {"type": "INTEGER"},
                            "fatherName": {"type": "INTEGER"},
                            "bloodGroup": {"type": "INTEGER"},
                            "aadhaarNumber": {"type": "INTEGER"},
                            "address": {"type": "INTEGER"}
                        }
                    }
                }
            }
        }
    }
    
    try:
        data_json = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(
            url,
            data=data_json,
            headers={"Content-Type": "application/json"},
            method="POST"
        )
        with urllib.request.urlopen(req, timeout=30) as response:
            res_body = response.read().decode("utf-8")
            res_json = json.loads(res_body)
            candidates = res_json.get("candidates", [])
            if candidates:
                text_content = candidates[0].get("content", {}).get("parts", [{}])[0].get("text", "")
                if text_content:
                    extracted_fields = json.loads(text_content.strip())
                    print("[SAHAYAK] Gemini extraction completed")
                    return extracted_fields
    except Exception as e:
        print("[SAHAYAK ERROR] Gemini API call failed:", e)
        
    return None


def validate_gemini_response(data: Dict[str, Any]) -> Dict[str, Any]:
    validated = {
        "full_name": None,
        "date_of_birth": None,
        "gender": None,
        "father_name": None,
        "mother_name": None,
        "blood_group": None,
        "aadhaar_number": None,
        "pan_number": None,
        "driving_licence_number": None,
        "voter_id_number": None,
        "address": None,
        "state": None,
        "district": None,
        "pin_code": None,
        "annual_income": None,
        "occupation": None,
    }
    if not data:
        return validated

    # 1. Validate full name
    raw_name = data.get("fullName")
    if raw_name and isinstance(raw_name, str):
        raw_name = raw_name.strip()
        # Clean non-alphabetic characters
        clean_name = re.sub(r"[^A-Za-z\s\.]", "", raw_name)
        clean_name = re.sub(r"\s+", " ", clean_name).strip()
        if len(clean_name) >= 3 and not any(w.lower() in PROHIBITED_NAME_KEYWORDS for w in clean_name.split()):
            # Count vowels and consonants to filter random keystrokes
            vowels = len(re.findall(r"[aeiouAEIOU]", clean_name))
            consonants = len(re.findall(r"[bcdfghjklmnpqrstvwxyzBCDFGHJKLMNPQRSTVWXYZ]", clean_name))
            if vowels > 0 and not (consonants / vowels > 5 and len(clean_name) > 10):
                validated["full_name"] = clean_name
            else:
                print(f"[SAHAYAK VALIDATOR] Rejected name due to vowel/consonant ratio: {clean_name}")
        else:
            print(f"[SAHAYAK VALIDATOR] Rejected name due to symbols/prohibited words: {raw_name}")

    # 2. Validate DOB (Label-aware validation)
    raw_dob = data.get("dateOfBirth")
    dob_label = data.get("dateOfBirthLabel")
    dob_conf = data.get("dateOfBirthConfidence")
    
    # Log raw date candidates inside payload for debugging
    all_dates = re.findall(r'\b\d{1,2}[/\.\-]\d{1,2}[/\.\-]\d{4}\b', str(data))
    
    dob_valid = False
    validated_dob = None
    
    if raw_dob and isinstance(raw_dob, str):
        raw_dob = raw_dob.strip()
        match = re.search(r"\b(\d{1,2})[/\.\-](\d{1,2})[/\.\-](\d{4})\b", raw_dob)
        if match:
            day = int(match.group(1))
            month = int(match.group(2))
            year = int(match.group(3))
            
            if is_valid_calendar_date(day, month, year):
                # Verify label contains target sub-string match
                allowed_labels = ["dob", "date of birth", "जन्म तिथि", "birth", "date_of_birth"]
                lbl_lower = str(dob_label).strip().lower() if dob_label else ""
                
                label_ok = any(l in lbl_lower for l in allowed_labels)
                conf_ok = isinstance(dob_conf, (int, float)) and dob_conf >= 70
                
                if label_ok and conf_ok:
                    validated_dob = f"{day:02d}/{month:02d}/{year}"
                    dob_valid = True
                else:
                    print(f"[SAHAYAK VALIDATOR] DOB label/confidence failed check: label_ok={label_ok}, conf_ok={conf_ok}")
            else:
                print(f"[SAHAYAK VALIDATOR] DOB rejected (invalid calendar range): {raw_dob}")
                
    if dob_valid:
        validated["date_of_birth"] = validated_dob
    else:
        validated["date_of_birth"] = None

    # Print debugging metrics exactly as requested by test requirements
    print(f"Document type: {data.get('documentType', 'Unknown')}")
    print(f"Raw Gemini JSON response: {data}")
    print(f"Extracted DOB: {raw_dob if raw_dob else 'None'}")
    print(f"DOB confidence: {'high' if isinstance(dob_conf, (int, float)) and dob_conf >= 70 else 'low'}")
    print(f"DOB validation: {'passed' if dob_valid else 'failed'}")

    # 3. Validate State
    raw_state = data.get("state")
    if raw_state and isinstance(raw_state, str):
        raw_state = raw_state.strip()
        from services.document_extractor.state_detector import detect_state_from_text
        detected_state = detect_state_from_text(raw_state)
        if detected_state:
            validated["state"] = detected_state
        else:
            print(f"[SAHAYAK VALIDATOR] Rejected State match: {raw_state}")

    # 4. Validate Address
    raw_address = data.get("address")
    if raw_address and isinstance(raw_address, str):
        raw_address = raw_address.strip()
        letters = re.sub(r"[^A-Za-z]", "", raw_address)
        non_alphanumeric = re.sub(r"[A-Za-z0-9\s,\/\.\-]", "", raw_address)
        if len(letters) >= 10 and (len(non_alphanumeric) / len(raw_address) <= 0.25):
            validated["address"] = mask_aadhaar_number(raw_address)
        else:
            print(f"[SAHAYAK VALIDATOR] Rejected Address noise: {raw_address}")

    # 5. Populate and validate new fields
    raw_gender = data.get("gender")
    if raw_gender and isinstance(raw_gender, str):
        g_clean = raw_gender.strip().lower()
        if "female" in g_clean:
            validated["gender"] = "Female"
        elif "male" in g_clean:
            validated["gender"] = "Male"
        elif "trans" in g_clean:
            validated["gender"] = "Transgender"
        else:
            validated["gender"] = raw_gender.strip()

    raw_father = data.get("fatherName")
    if raw_father and isinstance(raw_father, str):
        raw_father = raw_father.strip()
        clean_f = re.sub(r"[^A-Za-z\s\.]", "", raw_father)
        clean_f = re.sub(r"\s+", " ", clean_f).strip()
        if len(clean_f) >= 3:
            validated["father_name"] = clean_f

    raw_mother = data.get("motherName")
    if raw_mother and isinstance(raw_mother, str):
        raw_mother = raw_mother.strip()
        clean_m = re.sub(r"[^A-Za-z\s\.]", "", raw_mother)
        clean_m = re.sub(r"\s+", " ", clean_m).strip()
        if len(clean_m) >= 3:
            validated["mother_name"] = clean_m

    raw_bg = data.get("bloodGroup")
    if raw_bg and isinstance(raw_bg, str):
        bg_match = re.search(r"\b(A|B|AB|O)[\s]*[\+\-]\b", raw_bg, re.IGNORECASE)
        if bg_match:
            validated["blood_group"] = raw_bg.strip().upper()

    raw_aadhaar = data.get("aadhaarNumber")
    if raw_aadhaar and isinstance(raw_aadhaar, str):
        digits = re.sub(r"\D", "", raw_aadhaar)
        if len(digits) == 12:
            validated["aadhaar_number"] = digits

    raw_pan = data.get("panNumber")
    if raw_pan and isinstance(raw_pan, str):
        pan_clean = re.sub(r"[^A-Za-z0-9]", "", raw_pan).strip().upper()
        if len(pan_clean) == 10:
            validated["pan_number"] = pan_clean

    raw_dl = data.get("drivingLicenceNumber")
    if raw_dl and isinstance(raw_dl, str):
        validated["driving_licence_number"] = raw_dl.strip().upper()

    raw_voter = data.get("voterIdNumber")
    if raw_voter and isinstance(raw_voter, str):
        validated["voter_id_number"] = raw_voter.strip().upper()

    raw_district = data.get("district")
    if raw_district and isinstance(raw_district, str):
        validated["district"] = raw_district.strip()

    raw_pin = data.get("pinCode")
    if raw_pin and isinstance(raw_pin, str):
        pin_digits = re.sub(r"\D", "", raw_pin)
        if len(pin_digits) == 6:
            validated["pin_code"] = pin_digits

    # 6. Populate metadata fields
    if data.get("annualIncome"):
        validated["annual_income"] = str(data["annualIncome"]).strip()
    if data.get("occupation"):
        validated["occupation"] = str(data["occupation"]).strip()

    # Pass confidence block through metadata key
    raw_conf = data.get("confidence", {})
    validated["_confidence"] = {
        "full_name": raw_conf.get("fullName", 100),
        "date_of_birth": dob_conf if isinstance(dob_conf, (int, float)) else 100,
        "gender": raw_conf.get("gender", 100),
        "father_name": raw_conf.get("fatherName", 100),
        "blood_group": raw_conf.get("bloodGroup", 100),
        "aadhaar_number": raw_conf.get("aadhaarNumber", 100),
        "address": raw_conf.get("address", 100),
        "state": raw_conf.get("state", 100)
    }

    print("[SAHAYAK] Structured data validated")
    return validated


def clean_ocr_text(text: str) -> str:
    """Normalize whitespace, remove symbols caused by OCR, handle Hindi + English."""
    if not text:
        return ""
    # Remove OCR noise symbols but keep letters, numbers, spaces, commas, slashes, dots, hyphens
    cleaned = re.sub(r"[\|\{\}\[\]~\^`]", "", text)
    cleaned_lines = []
    for line in cleaned.splitlines():
        cleaned_line = re.sub(r"[ \t]+", " ", line).strip()
        if cleaned_line:
            cleaned_lines.append(cleaned_line)
    return "\n".join(cleaned_lines)


def mask_aadhaar_number(text: str) -> str:
    """Mask 12-digit Aadhaar numbers from being saved or returned for security."""
    if not text:
        return ""
    # Mask format "1234 5678 9012"
    masked = re.sub(r"\b\d{4}\s\d{4}\s\d{4}\b", "XXXX XXXX XXXX", text)
    # Mask format "1234-5678-9012"
    masked = re.sub(r"\b\d{4}-\d{4}-\d{4}\b", "XXXX-XXXX-XXXX", masked)
    # Mask continuous 12-digit numbers
    masked = re.sub(r"\b\d{12}\b", "XXXXXXXXXXXX", masked)
    return masked


def is_aadhaar_card(text: str) -> bool:
    """Verify if the document is an Aadhaar card using keywords."""
    if not text:
        return False
    markers = [
        "aadhaar", "aadhar", "unique identification", "uidai",
        "govt of india", "government of india", "भारत सरकार",
        "नाम", "जन्म तिथि", "पुरुष", "महिला"
    ]
    norm = text.lower()
    return any(m in norm for m in markers)


def extract_aadhaar_name(text: str) -> Optional[str]:
    """Aadhaar-specific name extraction using DOB/Gender structural positioning."""
    lines = [l.strip() for l in text.splitlines() if l.strip()]
    dob_idx = -1
    for i, line in enumerate(lines):
        if re.search(r"dob|date of birth|year of birth|yob|जन्म तिथि|\b\d{2}[/\.-]\d{2}[/\.-]\d{4}\b", line, re.IGNORECASE):
            dob_idx = i
            break
            
    if dob_idx == -1:
        # Try gender line fallback
        for i, line in enumerate(lines):
            if re.search(r"\b(male|female|transgender|पुरुष|महिला)\b", line, re.IGNORECASE):
                dob_idx = i
                break
                
    if dob_idx != -1:
        candidates = []
        for offset in range(1, 4):
            idx = dob_idx - offset
            if idx >= 0:
                candidate = lines[idx]
                # Strip common field label prefixes
                candidate = re.sub(r"^(?:name|full name|नाम|fullname)\s*[:\-]\s*", "", candidate, flags=re.IGNORECASE)
                # Keep only alphabetical words and spaces
                candidate = re.sub(r"[^A-Za-z\s\.]", "", candidate)
                candidate = re.sub(r"\s+", " ", candidate).strip()
                
                if len(candidate) >= 3 and len(candidate) <= 50:
                    words = candidate.split()
                    if any(w.lower() in PROHIBITED_NAME_KEYWORDS for w in words):
                        continue
                    
                    score = 0
                    if len(words) >= 2:
                        score += 10 # Prefer 2 or more words
                    
                    # Position bonus (closer lines get higher priority)
                    score += (4 - offset)
                    
                    candidates.append((candidate, score))
                    
        if candidates:
            candidates.sort(key=lambda x: x[1], reverse=True)
            name_candidate = candidates[0][0]
            print(f"[SAHAYAK OCR] Name candidates found: {candidates}")
            return name_candidate
            
    return None


def extract_aadhaar_dob(text: str) -> Optional[str]:
    """Aadhaar-specific Date of Birth extraction with digit range validations."""
    patterns = [
        r"\b(\d{2})[/\.\-](\d{2})[/\.\-](\d{4})\b",
    ]
    for pattern in patterns:
        matches = re.findall(pattern, text)
        for m in matches:
            d, m_val, y = m
            day = int(d)
            month = int(m_val)
            year = int(y)
            if 1 <= day <= 31 and 1 <= month <= 12 and 1900 <= year <= 2026:
                dob_str = f"{d}/{m_val}/{y}"
                print(f"[SAHAYAK OCR] DOB detected: {dob_str}")
                return dob_str
    return None


def extract_aadhaar_gender(text: str) -> Optional[str]:
    """Extract gender from Aadhaar matching keywords."""
    if re.search(r"\b(female|woman|महिला)\b", text, re.IGNORECASE):
        print("[SAHAYAK OCR] Gender detected: Female")
        return "Female"
    elif re.search(r"\b(male|man|पुरुष)\b", text, re.IGNORECASE):
        print("[SAHAYAK OCR] Gender detected: Male")
        return "Male"
    return None


def extract_aadhaar_address(text: str) -> Optional[str]:
    """Extract clean address from Aadhaar card back side, avoiding front side noise."""
    lines = [l.strip() for l in text.splitlines() if l.strip()]
    address_start_idx = -1
    
    # 1. Locate Address or S/O/W/O markers
    for i, line in enumerate(lines):
        if re.search(r"\b(address|पता|s/o|d/o|w/o|c/o)\b", line, re.IGNORECASE):
            address_start_idx = i
            break
            
    if address_start_idx == -1:
        return None
        
    collected_lines = []
    first_line = lines[address_start_idx]
    # Strip prefix labels
    first_line = re.sub(r"^(?:address|पता)\s*[:\-]\s*", "", first_line, flags=re.IGNORECASE)
    if first_line.strip():
        collected_lines.append(first_line.strip())
        
    # Read up to 5 lines after the address start
    for idx in range(address_start_idx + 1, min(len(lines), address_start_idx + 6)):
        line = lines[idx]
        
        # Stop on helplines, disclaimers, web resources, or emblem text
        if re.search(r"uidai|help|toll|phone|mobile|www\.|unique identification|government|govt|भारत|सरकार", line, re.IGNORECASE):
            break
        if re.search(r"proof of identity|identity|citizenship|पहचान का प्रमाण|नागरिकता", line, re.IGNORECASE):
            break
        # Skip Aadhaar numbers
        if re.search(r"\b\d{4}\s\d{4}\s\d{4}\b", line) or re.search(r"\b\d{12}\b", line):
            continue
            
        collected_lines.append(line)
        
        # Stop collecting after matching a 6-digit PIN code line
        if re.search(r"\b\d{6}\b", line):
            break
            
    if collected_lines:
        address_str = ", ".join(collected_lines)
        address_str = re.sub(r",\s*,", ",", address_str)
        address_str = re.sub(r"\s+", " ", address_str)
        address_str = address_str.strip(", ")
        
        if len(address_str) >= 15 and re.search(r"[A-Za-z]", address_str):
            return address_str
            
    return None


def calculate_confidences(profile: Dict[str, Any], raw_text: str) -> Dict[str, Any]:
    """Calculate extraction confidence maps for fields."""
    confidences = {}
    
    # 1. Full name
    name = profile.get("full_name")
    if name:
        words = name.split()
        if len(words) >= 2:
            confidences["full_name"] = {"value": name, "confidence": "high"}
        else:
            confidences["full_name"] = {"value": name, "confidence": "medium"}
    else:
        confidences["full_name"] = {"value": None, "confidence": "low"}
        
    # 2. DOB
    dob = profile.get("date_of_birth")
    if dob:
        confidences["date_of_birth"] = {"value": dob, "confidence": "high"}
    else:
        confidences["date_of_birth"] = {"value": None, "confidence": "low"}
        
    # 3. Gender
    gender = profile.get("gender")
    if gender:
        confidences["gender"] = {"value": gender, "confidence": "high"}
    else:
        confidences["gender"] = {"value": None, "confidence": "low"}
        
    # 4. Address
    addr = profile.get("address")
    if addr and len(addr) >= 15:
        confidences["address"] = {"value": addr, "confidence": "high"}
    else:
        confidences["address"] = {"value": None, "confidence": "low"}
        
    return confidences


def extract_full_name(text: str) -> Optional[str]:
    """
    Extract Full Name using multi-tier strategy.
    """
    if not text or not text.strip():
        return None

    if is_aadhaar_card(text):
        name = extract_aadhaar_name(text)
        if name:
            return name

    # Priority 1: Explicit Name Labels
    label_patterns = [
        r"(?:Full\s*Name|Name\s*of\s*Applicant|Holder\s*Name|Name)\s*[:\-]\s*([A-Za-z\s\.]+)",
        r"(?:Shri|Smt|Kumari|Mr|Mrs|Ms)\.?\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)",
    ]
    for pattern in label_patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            raw_val = match.group(1).split("\n")[0].strip()
            candidate = re.sub(r"\s+", " ", raw_val)
            words = [w for w in candidate.split() if w.lower() not in PROHIBITED_NAME_KEYWORDS]
            if len(words) >= 1:
                result = " ".join(words[:4])
                if is_valid_name_candidate(result):
                    return result

    # Priority 2: Aadhaar Structural Analysis
    lines = [line.strip() for line in text.splitlines() if line.strip()]

    # Locate Government / Aadhaar header line index
    govt_idx = -1
    for i, line in enumerate(lines):
        if re.search(r"government|govt|bharat|भारत|sarkar|सरकार|unique identification|uidai", line, re.IGNORECASE):
            govt_idx = i
            break

    # Locate DOB / Gender line index
    dob_idx = -1
    for i, line in enumerate(lines):
        if re.search(r"dob|date of birth|year of birth|yob|\b(male|female|transgender)\b|\b\d{2}[/\.-]\d{2}[/\.-]\d{4}\b", line, re.IGNORECASE):
            dob_idx = i
            break

    # 2a. Check lines between Government header and DOB/Gender
    if govt_idx != -1 and dob_idx != -1 and dob_idx > govt_idx:
        for i in range(govt_idx + 1, dob_idx):
            candidate = lines[i]
            if is_valid_name_candidate(candidate):
                return candidate

    # 2b. Check lines immediately before DOB/Gender if header missing or range search yielded nothing
    if dob_idx != -1 and dob_idx > 0:
        for i in range(max(0, dob_idx - 3), dob_idx):
            candidate = lines[i]
            if is_valid_name_candidate(candidate):
                return candidate

    # 2c. Fallback line scan for valid alphabetic candidate line
    for line in lines:
        if is_valid_name_candidate(line):
            return line

    return None


def extract_date_of_birth(text: str) -> Optional[str]:
    """Extract Date of Birth (DD/MM/YYYY or YYYY-MM-DD)."""
    # Prioritize Aadhaar date validation
    aadhaar_dob = extract_aadhaar_dob(text)
    if aadhaar_dob:
        return aadhaar_dob

    patterns = [
        r"(?:DOB|Date\s*of\s*Birth|Birth\s*Date)\s*[:\-]?\s*(\d{2}[/\.\-]\d{2}[/\.\-]\d{4})",
        r"(?:DOB|Date\s*of\s*Birth|Birth\s*Date)\s*[:\-]?\s*(\d{4}[/\.\-]\d{2}[/\.\-]\d{2})",
        r"\b(\d{2}[/\.\-]\d{2}[/\.\-]\d{4})\b",
    ]
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            return match.group(1).strip()
    return None


def extract_state(text: str) -> Optional[str]:
    """Extract State using Indian state names match and PIN prefix ranges."""
    return detect_state_from_text(text)


def extract_address(text: str) -> Optional[str]:
    """Extract Address string using keywords, nearby lines, or PIN code line context."""
    if not text or not text.strip():
        return None

    # Prioritize Aadhaar back side address extraction
    if is_aadhaar_card(text):
        addr = extract_aadhaar_address(text)
        if addr:
            print("[SAHAYAK OCR] Address confidence: high")
            return addr
        else:
            print("[SAHAYAK OCR] Address confidence: low")
            return None

    lines = [line.strip() for line in text.splitlines() if line.strip()]
    address_indicators = [
        "address", "s/o", "d/o", "c/o", "w/o", "house", "plot", "street", "road",
        "village", "ward", "post", "po", "district", "city", "state", "pin"
    ]

    addr_str = None

    for i, line in enumerate(lines):
        match = re.search(r"\b(?:address|addr|residence)\b\s*[:\-]\s*(.*)", line, re.IGNORECASE)
        if match:
            val = match.group(1).strip()
            collected = []
            if val:
                collected.append(val)
            for j in range(i + 1, min(len(lines), i + 5)):
                next_line = lines[j]
                if re.search(r"government|govt|uidai|help|toll|phone|mobile", next_line, re.IGNORECASE):
                    break
                collected.append(next_line)
            if collected:
                addr_str = ", ".join(collected)
                break

    if not addr_str:
        for i, line in enumerate(lines):
            if any(re.search(r"\b" + re.escape(indicator) + r"\b", line, re.IGNORECASE) for indicator in address_indicators):
                collected = []
                for j in range(i, min(len(lines), i + 5)):
                    next_line = lines[j]
                    if re.search(r"government|govt|uidai|help|toll|phone|mobile", next_line, re.IGNORECASE):
                        break
                    collected.append(next_line)
                if collected:
                    addr_str = ", ".join(collected)
                    break

    if not addr_str:
        for i, line in enumerate(lines):
            if re.search(r"\b\d{6}\b", line):
                start_idx = max(0, i - 3)
                collected = []
                for j in range(start_idx, i + 1):
                    next_line = lines[j]
                    if re.search(r"government|govt|uidai|help|toll|phone|mobile", next_line, re.IGNORECASE):
                        continue
                    collected.append(next_line)
                if collected:
                    addr_str = ", ".join(collected)
                    break

    if addr_str:
        addr_str = re.sub(r"[\{\}\[\]\|~\^]", "", addr_str)
        addr_str = re.sub(r",\s*,", ",", addr_str)
        addr_str = re.sub(r"\s+", " ", addr_str)
        addr_str = addr_str.strip(", ")

        cleaned = re.sub(r"[^\w]", "", addr_str)
        if cleaned.isdigit() and len(cleaned) <= 8:
            return None
        return addr_str

    return None


def extract_annual_income(text: str) -> Optional[str]:
    """Extract Annual Income amount."""
    patterns = [
        r"(?:Annual\s*Income|Income|Total\s*Income)\s*[:\-]?\s*(?:₹|Rs\.?|INR)?\s*([\d,]+)",
        r"(?:₹|Rs\.?|INR)\s*([\d,]+(?:\s*per\s*annum)?)",
    ]
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            val = match.group(1).strip()
            if not val.startswith("₹") and not val.startswith("Rs"):
                return f"₹ {val}"
            return val
    return None


def extract_occupation(text: str) -> Optional[str]:
    """Extract Occupation matching common keywords or labels."""
    patterns = [
        r"(?:Occupation|Designation|Profession)\s*[:\-]\s*([A-Za-z\s]+)",
    ]
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            return match.group(1).strip().split("\n")[0]

    for occ in COMMON_OCCUPATIONS:
        pattern = r"\b" + re.escape(occ) + r"\b"
        if re.search(pattern, text, re.IGNORECASE):
            return occ

    return None


def extract_structured_fields(raw_text: str) -> Dict[str, Any]:
    """Extract structured fields from raw OCR text."""
    if not raw_text or not raw_text.strip():
        return {
            "full_name": None,
            "date_of_birth": None,
            "state": None,
            "address": None,
            "annual_income": None,
            "occupation": None,
        }

    # Clean the OCR text
    cleaned_text = clean_ocr_text(raw_text)
    
    # Mask/remove Aadhaar numbers for security
    secured_text = mask_aadhaar_number(cleaned_text)

    # Print debug logging
    print("----------------------------------------")
    print("[SAHAYAK OCR] Raw text extracted (secured):")
    print(secured_text)
    print("----------------------------------------")

    profile = {
        "full_name": extract_full_name(secured_text),
        "date_of_birth": extract_date_of_birth(secured_text),
        "state": extract_state(secured_text),
        "address": extract_address(secured_text),
        "annual_income": extract_annual_income(secured_text),
        "occupation": extract_occupation(secured_text),
    }

    # Extract gender separately if Aadhaar
    gender = extract_aadhaar_gender(secured_text)
    if gender:
        profile["gender"] = gender

    return profile


def merge_extracted_profiles(datasets: List[Dict[str, Any]], combined_text: str) -> Dict[str, Any]:
    """Intelligently combine profile datasets following preference merging rules."""
    merged = {
        "full_name": None,
        "date_of_birth": None,
        "gender": None,
        "father_name": None,
        "mother_name": None,
        "blood_group": None,
        "aadhaar_number": None,
        "pan_number": None,
        "driving_licence_number": None,
        "voter_id_number": None,
        "address": None,
        "state": None,
        "district": None,
        "pin_code": None,
        "annual_income": None,
        "occupation": None,
    }

    for data in datasets:
        if not data:
            continue
            
        # Merge Name: Prefer longer / more words
        name = data.get("full_name")
        if name and is_valid_name_candidate(name):
            if not merged["full_name"]:
                merged["full_name"] = name
            elif len(name.split()) > len(merged["full_name"].split()):
                merged["full_name"] = name

        # Merge DOB
        dob = data.get("date_of_birth")
        if dob:
            if not merged["date_of_birth"]:
                merged["date_of_birth"] = dob

        # Merge Gender
        gender = data.get("gender")
        if gender:
            if not merged["gender"]:
                merged["gender"] = gender

        # Merge Father's Name
        fn = data.get("father_name")
        if fn:
            if not merged["father_name"]:
                merged["father_name"] = fn
            elif len(fn) > len(merged["father_name"]):
                merged["father_name"] = fn

        # Merge Mother's Name
        mn = data.get("mother_name")
        if mn:
            if not merged["mother_name"]:
                merged["mother_name"] = mn
            elif len(mn) > len(merged["mother_name"]):
                merged["mother_name"] = mn

        # Merge Blood Group
        bg = data.get("blood_group")
        if bg:
            if not merged["blood_group"]:
                merged["blood_group"] = bg

        # Merge Aadhaar
        an = data.get("aadhaar_number")
        if an:
            if not merged["aadhaar_number"]:
                merged["aadhaar_number"] = an

        # Merge PAN
        pn = data.get("pan_number")
        if pn:
            if not merged["pan_number"]:
                merged["pan_number"] = pn

        # Merge DL
        dn = data.get("driving_licence_number")
        if dn:
            if not merged["driving_licence_number"]:
                merged["driving_licence_number"] = dn

        # Merge Voter ID
        vn = data.get("voter_id_number")
        if vn:
            if not merged["voter_id_number"]:
                merged["voter_id_number"] = vn

        # Merge State
        state = data.get("state")
        if state:
            if not merged["state"]:
                merged["state"] = state

        # Merge District
        dist = data.get("district")
        if dist:
            if not merged["district"]:
                merged["district"] = dist

        # Merge Pincode
        pin = data.get("pin_code")
        if pin:
            if not merged["pin_code"]:
                merged["pin_code"] = pin

        # Merge Address: Prefer longer meaningful address over shorter pincode strings
        addr = data.get("address")
        if addr:
            cleaned_addr = re.sub(r"[^\w]", "", addr)
            if not cleaned_addr.isdigit():
                if not merged["address"]:
                    merged["address"] = addr
                elif len(addr) > len(merged["address"]):
                    merged["address"] = addr

        # Merge Income
        income = data.get("annual_income")
        if income:
            if not merged["annual_income"]:
                merged["annual_income"] = income

        # Merge Occupation
        occ = data.get("occupation")
        if occ:
            if not merged["occupation"]:
                merged["occupation"] = occ

    # Extract State independently from combined text if still missing
    if not merged["state"] and combined_text:
        merged["state"] = extract_state(combined_text)

    # Ensure final address is not just a pincode
    if merged["address"]:
        cleaned = re.sub(r"[^\w]", "", merged["address"])
        if cleaned.isdigit():
            merged["address"] = None

    return merged


def save_profile_to_storage(profile_data: Dict[str, Any], user_id: Optional[int] = None):
    """Save extracted profile payload to storage."""
    if user_id is not None:
        from services.db import save_extracted_profile
        save_extracted_profile(user_id, profile_data)
        return

    with open(PROFILE_FILE, "w", encoding="utf-8") as f:
        json.dump(profile_data, f, indent=2)


def get_profile_from_storage(user_id: Optional[int] = None) -> Dict[str, Any]:
    """Retrieve stored profile payload."""
    if user_id is not None:
        from services.db import get_extracted_profile
        return get_extracted_profile(user_id)

    if PROFILE_FILE.exists():
        try:
            with open(PROFILE_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass

    return {
        "full_name": None,
        "date_of_birth": None,
        "state": None,
        "address": None,
        "annual_income": None,
        "occupation": None,
    }


@router.post("/extract-fields")
async def extract_fields_endpoint(
    files: Optional[List[UploadFile]] = File(None),
    file: Optional[UploadFile] = File(None),
    filenames: Optional[str] = Form(None),
    filename: Optional[str] = Form(None),
    raw_text_input: Optional[str] = Form(None),
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

    target_files_to_process = []

    # 1. Identify all files to process
    uploaded_list = []
    if files:
        uploaded_list.extend(files)
    if file:
        uploaded_list.append(file)

    user_upload_dir = UPLOAD_DIR / str(user_id)
    user_upload_dir.mkdir(parents=True, exist_ok=True)

    for uf in uploaded_list:
        if uf.filename:
            file_ext = Path(uf.filename).suffix.lower()
            if file_ext not in ALLOWED_EXTENSIONS:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Unsupported file type '{file_ext}' in '{uf.filename}'. Allowed formats: JPG, JPEG, PNG, PDF.",
                )
            file_bytes = await uf.read()
            await uf.close()

            saved_path = user_upload_dir / uf.filename
            with open(saved_path, "wb") as f:
                f.write(file_bytes)

            target_files_to_process.append((uf.filename, file_bytes))

    stored_names = []
    if filenames:
        if filenames.startswith("["):
            try:
                stored_names.extend(json.loads(filenames))
            except Exception:
                stored_names.extend([f.strip() for f in filenames.split(",") if f.strip()])
        else:
            stored_names.extend([f.strip() for f in filenames.split(",") if f.strip()])
    if filename:
        stored_names.append(filename)

    for name in stored_names:
        stored_file_path = user_upload_dir / name
        if not stored_file_path.exists():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"File '{name}' not found in storage. Please upload first.",
            )
        with open(stored_file_path, "rb") as f:
            file_bytes = f.read()
        target_files_to_process.append((name, file_bytes))

    # 2. Extract structured fields (Try Document AI pipeline first, then legacy Gemini, fallback to OCR)
    gemini_datasets = []
    gemini_success = False
    combined_ocr_text = ""
    confidence_data = {}  # May be populated by AI pipeline or computed later
    
    # Check if Gemini key is available
    api_key = os.getenv("GEMINI_API_KEY")
    
    # ━━━ NEW: Try the modular Document AI pipeline first ━━━
    if api_key and _AI_PIPELINE_AVAILABLE:
        print("[SAHAYAK] Using intelligent Document AI pipeline")
        try:
            ai_result = _ai_pipeline(
                files_to_process=target_files_to_process,
                document_type=document_type,
                document_subtype=document_subtype,
            )
            if ai_result and ai_result.get("profile"):
                final_merged_profile = ai_result["profile"]
                combined_ocr_text = ai_result.get("combined_text", "")
                gemini_success = True
                
                # Build confidence data from the AI pipeline's output
                confidence_data = ai_result.get("confidence_data", {})
                
                print("[SAHAYAK] Document AI pipeline completed successfully")
        except Exception as ai_err:
            print(f"[SAHAYAK WARNING] Document AI pipeline failed: {ai_err}")
            print("[SAHAYAK] Falling back to legacy Gemini extraction...")
            gemini_success = False

    # ━━━ LEGACY: Fall back to old Gemini extraction if AI pipeline didn't succeed ━━━
    if api_key and not gemini_success:
        print("[SAHAYAK] Using legacy Gemini extraction")
        for name, f_bytes in target_files_to_process:
            file_ext = Path(name).suffix.lower()
            mime_type = "image/jpeg"
            if file_ext == ".png":
                mime_type = "image/png"
            elif file_ext == ".pdf":
                mime_type = "application/pdf"
            
            print("[SAHAYAK DEBUG] Processing document details:")
            print(f"- Filename: {name}")
            print(f"- Image MIME type: {mime_type}")
            print(f"- Image size: {len(f_bytes)} bytes")
            print(f"- Sent to Gemini Vision: Yes")

            gemini_data = extract_structured_data_via_gemini(f_bytes, mime_type)
            if gemini_data:
                validated = validate_gemini_response(gemini_data)
                gemini_datasets.append(validated)
                gemini_success = True
                print(f"[SAHAYAK DEBUG] Raw extraction success status: Success")
                print(f"[SAHAYAK DEBUG] Parsed JSON result: {gemini_data}")
                print(f"[SAHAYAK DEBUG] Validation result: {validated}")
            else:
                print(f"[SAHAYAK DEBUG] Raw extraction success status: Failed")
                
        if gemini_success:
            fields_summary = []
            for ds in gemini_datasets:
                fields_summary.append(
                    f"Document Type: {ds.get('document_type')}\n"
                    f"Name: {ds.get('full_name')}\n"
                    f"DOB: {ds.get('date_of_birth')}\n"
                    f"Address: {ds.get('address')}"
                )
            combined_ocr_text = "\n\n".join(fields_summary)
            
            final_merged_profile = merge_extracted_profiles(gemini_datasets, combined_ocr_text)
            
            for ds in gemini_datasets:
                if ds.get("gender"):
                    final_merged_profile["gender"] = ds["gender"]

            # Apply address intelligence to legacy path too
            try:
                from services.document_ai.address_parser import enrich_address
                final_merged_profile = enrich_address(final_merged_profile)
            except ImportError:
                pass

            print("[SAHAYAK] Legacy Gemini extraction completed")

    # Fallback to local OCR pipeline if Gemini fails or key is missing
    if not gemini_success:
        print("[SAHAYAK WARNING] Gemini API key not found or call failed. Falling back to local OCR pipeline.")
        extracted_texts_list = []
        for name, f_bytes in target_files_to_process:
            file_ext = Path(name).suffix.lower()
            extracted_txt = ""
            try:
                if file_ext in [".jpg", ".jpeg", ".png"]:
                    extracted_txt = extract_text_from_image_bytes(f_bytes)
                elif file_ext == ".pdf":
                    extracted_txt = extract_text_from_pdf_bytes(f_bytes)

                if extracted_txt.strip():
                    extracted_texts_list.append({
                        "filename": name,
                        "text": extracted_txt
                    })
            except Exception as e:
                print(f"[OCR WARNING] Failed to extract from {name}: {str(e)}")

        # Add raw text input if any
        if raw_text_input:
            extracted_texts_list.append({
                "filename": "raw_text_input",
                "text": raw_text_input
            })

        # Validate we got text
        if not extracted_texts_list:
            if not files and not file and not filenames and not filename and not raw_text_input:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="No file, filename, or raw_text provided.",
                )
            else:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="No readable text could be extracted from any of the provided documents.",
                )

        # Combine OCR text
        combined_ocr_text = "\n\n".join([item["text"] for item in extracted_texts_list])

        # Extract fields
        datasets_to_merge = []
        for item in extracted_texts_list:
            ds = extract_structured_fields(item["text"])
            datasets_to_merge.append(ds)

        combined_dataset = extract_structured_fields(combined_ocr_text)
        datasets_to_merge.append(combined_dataset)

        # Merge profile fields following preferences
        final_merged_profile = merge_extracted_profiles(datasets_to_merge, combined_ocr_text)

        # Apply address intelligence to OCR fallback path too
        try:
            from services.document_ai.address_parser import enrich_address
            final_merged_profile = enrich_address(final_merged_profile)
        except ImportError:
            pass
        
        # Log local OCR extracted texts for debugging
        print("[SAHAYAK] OCR completed")
        print("[SAHAYAK] Extracted text available:")
        secured_log = mask_aadhaar_number(combined_ocr_text)
        print(secured_log)

    # 6. Save combined profile data to storage
    user_id = 1
    if authorization:
        try:
            token = authorization.split(" ")[1]
            user_data = verify_access_token(token)
            if user_data and "user_id" in user_data:
                user_id = user_data["user_id"]
        except Exception:
            pass

    # Mask final profile values to ensure no Aadhaar digits are stored
    for k, v in final_merged_profile.items():
        if isinstance(v, str):
            final_merged_profile[k] = mask_aadhaar_number(v)

    save_profile_to_storage(final_merged_profile, user_id=user_id)

    # Calculate confidence values (only if not already set by AI pipeline)
    if gemini_success and not isinstance(confidence_data, dict) or (isinstance(confidence_data, dict) and not confidence_data):
        confidence_data = {
            "full_name": { "value": final_merged_profile.get("full_name"), "confidence": 100 },
            "date_of_birth": { "value": final_merged_profile.get("date_of_birth"), "confidence": 100 },
            "state": { "value": final_merged_profile.get("state"), "confidence": 100 },
            "address": { "value": final_merged_profile.get("address"), "confidence": 100 }
        }
        for ds in gemini_datasets:
            if "_confidence" in ds:
                c = ds["_confidence"]
                confidence_data["full_name"]["confidence"] = min(confidence_data["full_name"]["confidence"], c.get("full_name", 100))
                confidence_data["date_of_birth"]["confidence"] = min(confidence_data["date_of_birth"]["confidence"], c.get("date_of_birth", 100))
                confidence_data["state"]["confidence"] = min(confidence_data["state"]["confidence"], c.get("state", 100))
                confidence_data["address"]["confidence"] = min(confidence_data["address"]["confidence"], c.get("address", 100))
    else:
        confidence_data = calculate_confidences(final_merged_profile, combined_ocr_text)

    # Secure the raw text for printing and transmission
    secured_raw_text = mask_aadhaar_number(combined_ocr_text)

    # 7. Print debug logs for uvicorn standard output
    print("----------------------------------------")
    print(f"[DEBUG OCR] Received {len(target_files_to_process)} uploaded files.")
    print(f"[DEBUG OCR] Combined OCR Text:\n{secured_raw_text}")
    print(f"[DEBUG OCR] Final merged profile:\n{final_merged_profile}")
    print("----------------------------------------")

    return {
        "success": True,
        "raw_text": secured_raw_text,
        "extracted_data": final_merged_profile,
        "confidence_data": confidence_data,
        "processed_files_count": len(target_files_to_process),
        "document_type": document_type,
        "document_subtype": document_subtype
    }
