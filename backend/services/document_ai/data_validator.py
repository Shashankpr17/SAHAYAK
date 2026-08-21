"""
SAHAYAK Document AI — Data Validator

Post-extraction validation layer that verifies, cleans, and scores
extracted profile data for reliability.

Validates:
    - Names: reject OCR garbage, preserve genuine names
    - DOB: valid calendar date, not future, semantically linked to birth
    - Aadhaar: 12-digit format, never log full number
    - PAN: standard ABCDE1234F pattern
    - PIN Code: 6-digit Indian format
    - Gender: normalize to Male/Female/Transgender
    - Confidence: high (≥80), medium (60-79), low (<60)
"""

import re
from typing import Dict, Any, Optional, Tuple
from datetime import datetime


# Words that should never appear in a person's name
PROHIBITED_NAME_KEYWORDS = {
    "government", "govt", "india", "bharat", "sarkar", "भारत", "सरकार",
    "unique", "identification", "authority", "uidai", "aadhaar", "aadhar",
    "date", "birth", "dob", "yob", "year", "male", "female", "transgender",
    "address", "residence", "enrollment", "help", "toll", "free", "vid",
    "number", "card", "identity", "signature", "thumb", "download", "issue",
    "father", "mother", "husband", "wife", "son", "daughter",
    "income", "tax", "department", "permanent", "account",
    "election", "commission", "transport", "motor", "vehicle",
}

# OCR garbage words that are clearly not names
OCR_GARBAGE_WORDS = {
    "GET", "CET", "CRT", "ARS", "PDF", "DOC", "IMG", "DOB", "UID",
    "VID", "GOVT", "INDIA", "PAN", "DL", "PIN", "OTP", "URL", "API",
}

# Valid DOB labels (used for semantic DOB validation)
VALID_DOB_LABELS = [
    "dob", "date of birth", "birth", "d.o.b",
    "जन्म तिथि", "जन्म दिनांक", "date_of_birth",
]

# Labels that are NOT DOB
INVALID_DOB_LABELS = [
    "issue", "valid", "expiry", "print", "registration",
    "application", "from", "till", "validity",
]

# PAN pattern: 5 uppercase letters, 4 digits, 1 uppercase letter
PAN_PATTERN = re.compile(r"^[A-Z]{5}[0-9]{4}[A-Z]$")


def validate_name(name: Optional[str]) -> Tuple[Optional[str], int]:
    """
    Validate and clean a person's name.
    
    Returns:
        Tuple of (cleaned_name_or_None, confidence_score)
    """
    if not name or not isinstance(name, str):
        return None, 0

    name = name.strip()
    
    # Must not contain digits
    if re.search(r"\d", name):
        return None, 0

    # Remove non-alphabetic characters (except spaces and dots for initials)
    clean = re.sub(r"[^A-Za-z\s\.]", "", name)
    clean = re.sub(r"\s+", " ", clean).strip()

    if len(clean) < 3 or len(clean) > 60:
        return None, 0

    words = clean.split()
    if len(words) < 1 or len(words) > 6:
        return None, 0

    # Check each word
    for word in words:
        word_lower = word.lower()
        word_upper = word.upper()
        
        # Reject prohibited keywords
        if word_lower in PROHIBITED_NAME_KEYWORDS:
            return None, 0
        
        # Reject known OCR garbage
        if word_upper in OCR_GARBAGE_WORDS:
            return None, 0

        # Check vowel presence for words >= 3 chars (skip initials like "S.")
        if len(word) >= 3 and not word.endswith("."):
            vowels = re.findall(r"[aeiouAEIOU]", word)
            if not vowels:
                return None, 0
            
            # Reject if consonant/vowel ratio is extreme
            consonants = len(re.findall(r"[bcdfghjklmnpqrstvwxyzBCDFGHJKLMNPQRSTVWXYZ]", word))
            if vowels and consonants / len(vowels) > 5:
                return None, 0

    # Calculate confidence
    confidence = 70
    if len(words) >= 2:
        confidence = 90
    if len(words) >= 3:
        confidence = 95

    return clean, confidence


def normalize_name(name: str) -> str:
    """
    Normalize a name for display: "SHASHANK PRASHANT" → "Shashank Prashant"
    Preserves initials like "S." and "S.K." and handles mixed case.
    """
    if not name:
        return ""
    
    words = name.split()
    normalized = []
    for word in words:
        if "." in word:
            parts = word.split(".")
            new_parts = []
            for p in parts:
                if len(p) <= 1:
                    new_parts.append(p.upper())
                else:
                    new_parts.append(p.capitalize())
            normalized.append(".".join(new_parts))
        else:
            normalized.append(word.capitalize())
    return " ".join(normalized)


def validate_dob(
    dob: Optional[str],
    dob_label: Optional[str] = None,
    dob_confidence: Optional[int] = None
) -> Tuple[Optional[str], int]:
    """
    Validate a date of birth string.
    
    Returns:
        Tuple of (normalized_dob_or_None, confidence_score)
    """
    if not dob or not isinstance(dob, str):
        return None, 0

    dob = dob.strip()
    
    # Try to parse DD/MM/YYYY or DD-MM-YYYY or DD.MM.YYYY
    match = re.search(r"\b(\d{1,2})[/\.\-](\d{1,2})[/\.\-](\d{4})\b", dob)
    if not match:
        return None, 0

    day = int(match.group(1))
    month = int(match.group(2))
    year = int(match.group(3))

    # Calendar validation
    if year < 1900 or year > datetime.now().year:
        return None, 0
    if month < 1 or month > 12:
        return None, 0

    # Days in month
    days_in_months = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
    if (year % 4 == 0 and year % 100 != 0) or (year % 400 == 0):
        days_in_months[1] = 29
    if day < 1 or day > days_in_months[month - 1]:
        return None, 0

    # Future date check
    try:
        parsed_date = datetime(year, month, day)
        if parsed_date > datetime.now():
            return None, 0
    except ValueError:
        return None, 0

    # Semantic DOB label validation
    confidence = 60  # Base confidence for a valid date

    if dob_label:
        label_lower = str(dob_label).strip().lower()
        
        # Check if label matches valid DOB labels
        is_dob_label = any(valid_label in label_lower for valid_label in VALID_DOB_LABELS)
        is_invalid_label = any(invalid in label_lower for invalid in INVALID_DOB_LABELS)
        
        if is_invalid_label:
            print(f"[VALIDATOR] DOB rejected: label '{dob_label}' matches invalid date type")
            return None, 0
        
        if is_dob_label:
            confidence = 90
    
    # Boost confidence from Gemini's own assessment
    if isinstance(dob_confidence, (int, float)) and dob_confidence >= 70:
        confidence = max(confidence, int(dob_confidence))

    # Format consistently as DD/MM/YYYY
    normalized = f"{day:02d}/{month:02d}/{year}"
    return normalized, confidence


def validate_aadhaar(number: Optional[str]) -> Tuple[Optional[str], int]:
    """Validate an Aadhaar number (12 digits). Never log full number."""
    if not number or not isinstance(number, str):
        return None, 0
    
    digits = re.sub(r"\D", "", number)
    if len(digits) == 12:
        # Basic Verhoeff check could go here in production
        return digits, 95
    
    return None, 0


def validate_pan(number: Optional[str]) -> Tuple[Optional[str], int]:
    """Validate a PAN number (ABCDE1234F pattern)."""
    if not number or not isinstance(number, str):
        return None, 0
    
    clean = re.sub(r"[^A-Za-z0-9]", "", number).strip().upper()
    if len(clean) == 10 and PAN_PATTERN.match(clean):
        return clean, 95
    
    return None, 0


def validate_pin_code(pin: Optional[str]) -> Tuple[Optional[str], int]:
    """Validate a 6-digit Indian PIN code."""
    if not pin or not isinstance(pin, str):
        return None, 0
    
    digits = re.sub(r"\D", "", pin)
    if len(digits) == 6 and digits[0] != "0":
        return digits, 90
    
    return None, 0


def validate_gender(gender: Optional[str]) -> Tuple[Optional[str], int]:
    """Normalize and validate gender."""
    if not gender or not isinstance(gender, str):
        return None, 0
    
    g = gender.strip().lower()
    
    if g in ("m", "male", "पुरुष", "man"):
        return "Male", 95
    elif g in ("f", "female", "महिला", "woman"):
        return "Female", 95
    elif "trans" in g:
        return "Transgender", 90
    elif len(g) > 0:
        # Unknown but provided
        return gender.strip().title(), 50
    
    return None, 0


def validate_dl_number(number: Optional[str]) -> Tuple[Optional[str], int]:
    """Validate a Driving Licence number."""
    if not number or not isinstance(number, str):
        return None, 0
    
    clean = number.strip().upper()
    if len(clean) >= 5:
        return clean, 85
    
    return None, 0


def validate_voter_id(number: Optional[str]) -> Tuple[Optional[str], int]:
    """Validate a Voter ID number."""
    if not number or not isinstance(number, str):
        return None, 0
    
    clean = number.strip().upper()
    if len(clean) >= 5:
        return clean, 85
    
    return None, 0


def validate_blood_group(bg: Optional[str]) -> Tuple[Optional[str], int]:
    """Validate a blood group value."""
    if not bg or not isinstance(bg, str):
        return None, 0
    
    match = re.search(r"\b(A|B|AB|O)\s*[\+\-]\b", bg.strip(), re.IGNORECASE)
    if match:
        return bg.strip().upper(), 90
    
    return None, 0


def confidence_label(score: int) -> str:
    """Convert numeric confidence to human-readable label."""
    if score >= 80:
        return "high"
    elif score >= 60:
        return "medium"
    else:
        return "low"


def mask_sensitive_id(value: str, visible_digits: int = 4) -> str:
    """
    Mask a sensitive ID for display.
    Example: "123456789012" → "XXXX XXXX 9012"
    """
    if not value:
        return ""
    digits = re.sub(r"\D", "", value)
    if len(digits) <= visible_digits:
        return value
    masked_part = "X" * (len(digits) - visible_digits)
    visible_part = digits[-visible_digits:]
    # Format Aadhaar-style: XXXX XXXX 1234
    if len(digits) == 12:
        return f"XXXX XXXX {visible_part}"
    return f"{masked_part}{visible_part}"
