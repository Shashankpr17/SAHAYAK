"""
SAHAYAK Document AI — Profile Intelligence

Transforms raw Gemini extraction output into a normalized, validated profile.
Handles:
    - Data normalization (name casing, gender, etc.)
    - Field validation through data_validator
    - Multi-document intelligent merge
    - Never overwrites confirmed values with empty values
"""

import re
from typing import Dict, Any, Optional, List

from services.document_ai.data_validator import (
    validate_name,
    normalize_name,
    validate_dob,
    validate_aadhaar,
    validate_pan,
    validate_pin_code,
    validate_gender,
    validate_dl_number,
    validate_voter_id,
    validate_blood_group,
    confidence_label,
)


def build_profile_from_gemini(gemini_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Transform raw Gemini structured JSON into a validated, normalized profile dict.
    
    The input follows the structured schema:
    {
        "documentType": "...",
        "personal": { "fullName": "...", ... },
        "identity": { "aadhaarNumber": "...", ... },
        "address": { "fullAddress": "...", "district": "...", ... },
        "additional": { ... },
        "confidence": { ... }
    }
    
    Returns a flat profile dict matching the existing backend format.
    """
    if not gemini_data:
        return _empty_profile()

    personal = gemini_data.get("personal", {}) or {}
    identity = gemini_data.get("identity", {}) or {}
    address = gemini_data.get("address", {}) or {}
    additional = gemini_data.get("additional", {}) or {}
    confidence = gemini_data.get("confidence", {}) or {}
    doc_type = gemini_data.get("documentType", "Unknown")

    print(f"[PROFILE AI] Processing document type: {doc_type}")

    # ── PERSONAL FIELDS ──────────────────────────────────────────
    
    # Full Name
    raw_name = personal.get("fullName", "")
    name_value, name_conf = validate_name(raw_name)
    if name_value:
        # Normalize for display but preserve ability to use original
        display_name = normalize_name(name_value)
    else:
        display_name = None
    
    # Date of Birth
    raw_dob = personal.get("dateOfBirth", "")
    dob_label = personal.get("dateOfBirthLabel", "")
    gemini_dob_conf = confidence.get("dateOfBirth", 0)
    dob_value, dob_conf = validate_dob(raw_dob, dob_label, gemini_dob_conf)

    # Gender
    raw_gender = personal.get("gender", "")
    gender_value, gender_conf = validate_gender(raw_gender)

    # Father's Name
    raw_father = personal.get("fatherName", "")
    father_value, father_conf = validate_name(raw_father)
    if father_value:
        father_value = normalize_name(father_value)

    # Mother's Name
    raw_mother = personal.get("motherName", "")
    mother_value, mother_conf = validate_name(raw_mother)
    if mother_value:
        mother_value = normalize_name(mother_value)

    # Blood Group
    raw_blood = personal.get("bloodGroup", "")
    blood_value, blood_conf = validate_blood_group(raw_blood)

    # ── IDENTITY FIELDS ──────────────────────────────────────────
    
    # Aadhaar Number
    raw_aadhaar = identity.get("aadhaarNumber", "")
    aadhaar_value, aadhaar_conf = validate_aadhaar(raw_aadhaar)

    # PAN Number
    raw_pan = identity.get("panNumber", "")
    pan_value, pan_conf = validate_pan(raw_pan)

    # Driving Licence Number
    raw_dl = identity.get("drivingLicenceNumber", "")
    dl_value, dl_conf = validate_dl_number(raw_dl)

    # Voter ID Number
    raw_voter = identity.get("voterIdNumber", "")
    voter_value, voter_conf = validate_voter_id(raw_voter)

    # ── ADDRESS FIELDS ───────────────────────────────────────────
    
    full_address = _clean_address(address.get("fullAddress", ""))
    district = _clean_field(address.get("district", ""))
    state = _clean_field(address.get("state", ""))
    raw_pin = address.get("pinCode", "")
    pin_value, pin_conf = validate_pin_code(raw_pin)

    # ── ADDITIONAL FIELDS ────────────────────────────────────────
    
    annual_income = _clean_field(additional.get("annualIncome", ""))
    occupation = _clean_field(additional.get("occupation", ""))

    # ── BUILD PROFILE ────────────────────────────────────────────

    profile = {
        "full_name": display_name,
        "date_of_birth": dob_value,
        "gender": gender_value,
        "father_name": father_value,
        "mother_name": mother_value,
        "blood_group": blood_value,
        "aadhaar_number": aadhaar_value,
        "pan_number": pan_value,
        "driving_licence_number": dl_value,
        "voter_id_number": voter_value,
        "address": full_address,
        "state": state,
        "district": district,
        "pin_code": pin_value,
        "annual_income": annual_income,
        "occupation": occupation,
    }

    # Build confidence metadata
    profile["_confidence"] = {
        "full_name": confidence.get("fullName", name_conf),
        "date_of_birth": confidence.get("dateOfBirth", dob_conf),
        "gender": confidence.get("gender", gender_conf),
        "father_name": confidence.get("fatherName", father_conf),
        "blood_group": blood_conf,
        "aadhaar_number": confidence.get("aadhaarNumber", aadhaar_conf),
        "pan_number": confidence.get("panNumber", pan_conf),
        "driving_licence_number": confidence.get("drivingLicenceNumber", dl_conf),
        "voter_id_number": confidence.get("voterIdNumber", voter_conf),
        "address": confidence.get("address", 80 if full_address else 0),
        "state": confidence.get("state", 80 if state else 0),
        "district": confidence.get("district", 80 if district else 0),
        "pin_code": confidence.get("pinCode", pin_conf),
    }

    # Debug logging (safe — no sensitive IDs)
    print(f"[PROFILE AI] Extracted fields:")
    print(f"  - Full Name: {display_name} (confidence: {confidence_label(profile['_confidence']['full_name'])})")
    print(f"  - DOB: {dob_value} (confidence: {confidence_label(profile['_confidence']['date_of_birth'])})")
    print(f"  - Gender: {gender_value}")
    print(f"  - Father: {father_value}")
    print(f"  - Address: {full_address[:60] if full_address else 'None'}...")
    print(f"  - District: {district}")
    print(f"  - State: {state}")
    print(f"  - PIN: {pin_value}")

    # Log identity fields safely (masked)
    if aadhaar_value:
        print(f"  - Aadhaar: XXXX XXXX {aadhaar_value[-4:]}")
    if pan_value:
        print(f"  - PAN: {pan_value[:2]}***{pan_value[-1:]}")
    if dl_value:
        print(f"  - DL: {dl_value}")
    if voter_value:
        print(f"  - Voter ID: {voter_value}")

    return profile


def merge_profiles(profiles: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Intelligently merge multiple document profiles into one unified profile.
    
    Rules:
    - Never overwrite a confirmed (non-empty) value with an empty value
    - Prefer longer/more complete names
    - Prefer higher confidence values
    - First non-empty value wins for identity numbers (Aadhaar, PAN, etc.)
    """
    merged = _empty_profile()
    merged_confidence = {}

    for profile in profiles:
        if not profile:
            continue

        p_conf = profile.get("_confidence", {})

        # Name: prefer longer (more words)
        name = profile.get("full_name")
        if name:
            if not merged["full_name"]:
                merged["full_name"] = name
            elif len(name.split()) > len(merged["full_name"].split()):
                merged["full_name"] = name

        # DOB: first valid wins, but prefer higher confidence
        dob = profile.get("date_of_birth")
        if dob and not merged["date_of_birth"]:
            merged["date_of_birth"] = dob

        # Gender: first wins
        _merge_first(merged, profile, "gender")
        
        # Father/Mother: prefer longer
        _merge_longer(merged, profile, "father_name")
        _merge_longer(merged, profile, "mother_name")
        
        # Blood group: first wins
        _merge_first(merged, profile, "blood_group")

        # Identity numbers: first wins (never overwrite)
        _merge_first(merged, profile, "aadhaar_number")
        _merge_first(merged, profile, "pan_number")
        _merge_first(merged, profile, "driving_licence_number")
        _merge_first(merged, profile, "voter_id_number")

        # Address: prefer longer meaningful address
        addr = profile.get("address")
        if addr:
            cleaned = re.sub(r"[^\w]", "", addr)
            if not cleaned.isdigit():
                if not merged["address"]:
                    merged["address"] = addr
                elif len(addr) > len(merged["address"]):
                    merged["address"] = addr

        # State/District/PIN: first wins
        _merge_first(merged, profile, "state")
        _merge_first(merged, profile, "district")
        _merge_first(merged, profile, "pin_code")

        # Additional: first wins
        _merge_first(merged, profile, "annual_income")
        _merge_first(merged, profile, "occupation")

        # Merge confidence (take minimum for fields that appear in multiple documents)
        for key, val in p_conf.items():
            if key not in merged_confidence:
                merged_confidence[key] = val
            else:
                merged_confidence[key] = min(merged_confidence[key], val)

    merged["_confidence"] = merged_confidence
    return merged


def _merge_first(merged: Dict, source: Dict, key: str):
    """Merge a field: first non-empty value wins."""
    val = source.get(key)
    if val and not merged.get(key):
        merged[key] = val


def _merge_longer(merged: Dict, source: Dict, key: str):
    """Merge a field: longer value wins."""
    val = source.get(key)
    if val:
        if not merged.get(key):
            merged[key] = val
        elif len(val) > len(merged[key]):
            merged[key] = val


def _clean_field(value: Optional[str]) -> Optional[str]:
    """Clean a field value: strip, return None if empty."""
    if not value or not isinstance(value, str):
        return None
    cleaned = value.strip()
    return cleaned if cleaned else None


def _clean_address(value: Optional[str]) -> Optional[str]:
    """Clean an address: remove OCR noise, normalize whitespace."""
    if not value or not isinstance(value, str):
        return None
    
    addr = value.strip()
    # Remove common OCR noise characters
    addr = re.sub(r"[\|\{\}\[\]~\^`]", "", addr)
    addr = re.sub(r",\s*,", ",", addr)
    addr = re.sub(r"\s+", " ", addr)
    addr = addr.strip(", ")
    
    # Validate minimum meaningful length
    letters = re.sub(r"[^A-Za-z]", "", addr)
    if len(letters) < 10:
        return None
    
    return addr


def _empty_profile() -> Dict[str, Any]:
    """Return an empty profile template."""
    return {
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
