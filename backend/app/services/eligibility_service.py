"""
eligibility_service.py — Deterministic Explainable Government Scheme Eligibility Engine
"""

import re
from datetime import datetime, date
from typing import Dict, Any, List, Optional
from app.services.scheme_service import ALL_SCHEMES_DATA, get_scheme_by_id


def calculate_age_from_dob(dob_str: Optional[str]) -> Optional[int]:
    """Calculate age in years from Date of Birth string or date object."""
    if not dob_str:
        return None

    if isinstance(dob_str, (datetime, date)):
        dt = dob_str if isinstance(dob_str, date) else dob_str.date()
        today = date.today()
        return today.year - dt.year - ((today.month, today.day) < (dt.month, dt.day))

    cleaned = str(dob_str).strip()
    formats = [
        "%d/%m/%Y", "%d-%m-%Y", "%d.%m.%Y",
        "%Y-%m-%d", "%Y/%m/%d", "%m/%d/%Y"
    ]
    today = date.today()
    for fmt in formats:
        try:
            dt = datetime.strptime(cleaned, fmt).date()
            age = today.year - dt.year - ((today.month, today.day) < (dt.month, dt.day))
            if 0 <= age <= 120:
                return age
        except ValueError:
            continue

    # Fallback for YYYY year only
    match = re.search(r"\b(19\d{2}|20[0-2]\d)\b", cleaned)
    if match:
        year = int(match.group(1))
        return today.year - year

    return None


def parse_annual_income_numeric(income_val: Any) -> Optional[int]:
    """Parse annual income string or float into numeric integer amount in ₹."""
    if income_val is None:
        return None
    if isinstance(income_val, (int, float)):
        return int(income_val)

    cleaned = str(income_val).replace(",", "").replace("₹", "").replace("Rs", "").replace("INR", "").strip()
    lakh_match = re.search(r"([\d\.]+)\s*lakh", cleaned, re.IGNORECASE)
    if lakh_match:
        try:
            return int(float(lakh_match.group(1)) * 100000)
        except ValueError:
            pass

    match = re.search(r"(\d+)", cleaned)
    if match:
        try:
            return int(match.group(1))
        except ValueError:
            pass

    return None


def evaluate_scheme_rules(scheme_id: str, profile: Dict[str, Any]) -> Dict[str, Any]:
    """Evaluate a single scheme against profile data and return status, reasons, and missing_information."""
    scheme_meta = get_scheme_by_id(scheme_id)
    if not scheme_meta:
        return {
            "id": scheme_id,
            "name": scheme_id,
            "category": "General",
            "status": "needs_more_information",
            "reasons": ["Scheme details available"],
            "missing_information": [],
            "official_link": "https://india.gov.in"
        }

    name = scheme_meta["name"]
    category = scheme_meta["category"]
    official_link = scheme_meta["official_link"]

    age = profile.get("age")
    occupation = (profile.get("occupation") or "").strip().lower()
    income_num = profile.get("annual_income_numeric")
    income_str = str(profile.get("annual_income") or "")
    state = (profile.get("state") or "").strip()

    reasons: List[str] = []
    missing_info: List[str] = []
    status = "possible"

    sid = scheme_id.lower()

    # 1. PMJAY (Ayushman Bharat)
    if sid == "pmjay":
        if income_num is not None and income_num <= 500000:
            status = "eligible"
            reasons.append(f"Your annual income (₹{income_num:,}) is within the Ayushman Bharat healthcare support threshold (≤ ₹5 Lakh)")
        elif "student" in occupation or "farmer" in occupation or "worker" in occupation:
            status = "possible"
            reasons.append(f"Your occupation ({profile.get('occupation')}) qualifies under priority healthcare welfare categories")
        else:
            status = "possible"
            reasons.append("Universal health coverage eligibility subject to SECC/ration card verification")

    # 2. PMJJBY (Life Insurance)
    elif sid == "pmjjby":
        if age is not None and 18 <= age <= 50:
            status = "eligible"
            reasons.append(f"Your age ({age} years) is within the eligible entry range (18–50 years)")
        elif age is not None and age > 50:
            status = "not_eligible"
            reasons.append(f"Age ({age} years) exceeds maximum entry age of 50 years")
        else:
            missing_info.append("Date of Birth / Age verification required")

    # 3. PMSBY (Accident Insurance)
    elif sid == "pmsby":
        if age is not None and 18 <= age <= 70:
            status = "eligible"
            reasons.append(f"Your age ({age} years) meets the PMSBY entry criterion (18–70 years)")
        elif age is not None and age > 70:
            status = "not_eligible"
            reasons.append(f"Age ({age} years) exceeds the maximum limit of 70 years")
        else:
            missing_info.append("Date of Birth / Age verification required")

    # 4. PM-KISAN
    elif sid == "pm-kisan":
        if "farmer" in occupation or "agriculture" in occupation or "cultivator" in occupation:
            status = "eligible"
            reasons.append(f"Your occupation ({profile.get('occupation')}) qualifies for PM-KISAN financial income support")
        elif not occupation:
            status = "possible"
            reasons.append("Available to all landholding farmer families upon land record verification")
        else:
            status = "possible"
            reasons.append(f"Requires cultivable landholding verification for occupation: {profile.get('occupation')}")

    # 5. PMKMY (Farmer Pension)
    elif sid == "pmkmy":
        if "farmer" in occupation or "agriculture" in occupation:
            if age is not None and 18 <= age <= 40:
                status = "eligible"
                reasons.append(f"Eligible farmer aged {age} (entry age: 18–40 years)")
            elif age is not None:
                status = "not_eligible"
                reasons.append(f"Age ({age}) is outside entry bracket of 18–40 years")
        else:
            status = "possible"
            reasons.append("Open to small and marginal farmers aged 18–40")

    # 6. PMFBY (Crop Insurance)
    elif sid == "pmfby":
        if "farmer" in occupation or "agriculture" in occupation:
            status = "eligible"
            reasons.append(f"Eligible for notified crop insurance coverage as {profile.get('occupation')}")
        else:
            status = "possible"
            reasons.append("Available to farmers growing notified food crops and oilseeds")

    # 7. NMMSS / Student Scholarship
    elif sid in ("nmmss", "student-scholarship"):
        if "student" in occupation or (age is not None and age <= 25):
            status = "eligible"
            if income_num is not None and income_num <= 350000:
                reasons.append(f"Income of ₹{income_num:,} satisfies the low-income threshold (≤ ₹3.5 Lakh)")
            reasons.append("Eligible for student tuition assistance & maintenance allowance")
        elif not occupation:
            status = "possible"
            reasons.append("Available to enrolled students meeting family income criteria")
        else:
            status = "possible"
            reasons.append("Requires active educational institution enrollment verification")

    # 8. PMEGP (Self-Employment)
    elif sid == "pmegp":
        if age is not None and age >= 18:
            status = "eligible"
            reasons.append(f"Adult citizen (age {age}) eligible for micro-enterprise setup subsidy up to 35%")
        else:
            status = "eligible"
            reasons.append("Eligible for non-farm business startup credit subsidy")

    # 9. PMMY (Mudra Loan)
    elif sid == "pmmy":
        status = "eligible"
        reasons.append("Eligible to apply for collateral-free micro-enterprise loans up to ₹10 Lakh")

    # 10. PMAY-U / PMAY-G (Housing)
    elif sid in ("pmay-u", "pmay-g"):
        if income_num is not None and income_num <= 600000:
            status = "eligible"
            reasons.append(f"Income of ₹{income_num:,} qualifies for EWS/LIG interest subsidy and housing assistance")
        else:
            status = "possible"
            reasons.append("Subject to verification of non-ownership of pucca house anywhere in India")

    else:
        status = "eligible"
        reasons.append("National welfare scheme open to eligible citizens")

    return {
        "id": scheme_id,
        "name": name,
        "category": category,
        "status": status,
        "reasons": reasons,
        "missing_information": missing_info,
        "official_link": official_link
    }


def evaluate_eligibility_for_profile(raw_profile: Dict[str, Any]) -> Dict[str, Any]:
    """
    Evaluate user profile against all government schemes.
    Returns categorized scheme evaluation lists with explainable match reasons.
    """
    dob = raw_profile.get("date_of_birth") or raw_profile.get("dob")
    income_str = raw_profile.get("annual_income") or raw_profile.get("annualIncome")

    age = calculate_age_from_dob(dob)
    income_num = parse_annual_income_numeric(income_str)

    evaluated_profile = {
        "full_name": raw_profile.get("full_name") or raw_profile.get("fullName"),
        "date_of_birth": str(dob) if dob else None,
        "age": age,
        "state": raw_profile.get("state"),
        "address": raw_profile.get("address"),
        "annual_income": str(income_str) if income_str else None,
        "annual_income_numeric": income_num,
        "occupation": raw_profile.get("occupation")
    }

    eligible_schemes: List[Dict[str, Any]] = []
    possible_schemes: List[Dict[str, Any]] = []
    needs_more_info: List[Dict[str, Any]] = []
    all_evaluations: List[Dict[str, Any]] = []

    for scheme in ALL_SCHEMES_DATA:
        scheme_id = scheme["id"]
        result = evaluate_scheme_rules(scheme_id, evaluated_profile)
        all_evaluations.append(result)

        stat = result["status"]
        if stat == "eligible":
            eligible_schemes.append(result)
        elif stat == "possible":
            possible_schemes.append(result)
        elif stat == "needs_more_information":
            needs_more_info.append(result)

    return {
        "success": True,
        "profile": evaluated_profile,
        "eligible_schemes": eligible_schemes,
        "possible_schemes": possible_schemes,
        "needs_more_information": needs_more_info,
        "all_schemes": all_evaluations
    }
