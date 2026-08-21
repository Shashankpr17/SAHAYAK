import re
from datetime import datetime, date
from typing import Dict, Any, List, Optional, Tuple
from schemes.service import get_scheme_by_id


def calculate_age_from_dob(dob_str: Optional[str]) -> Optional[int]:
    """Calculate age in years from Date of Birth string."""
    if not dob_str or not dob_str.strip():
        return None

    cleaned = dob_str.strip()
    # Try various date formats
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


def parse_annual_income_numeric(income_str: Optional[str]) -> Optional[int]:
    """Parse annual income string into numeric integer amount in ₹."""
    if not income_str or not income_str.strip():
        return None

    cleaned = income_str.replace(",", "").replace("₹", "").replace("Rs", "").replace("INR", "").strip()

    # Look for lakh conversion (e.g., "8.5 lakh" or "8.5lakh")
    lakh_match = re.search(r"([\d\.]+)\s*lakh", cleaned, re.IGNORECASE)
    if lakh_match:
        try:
            return int(float(lakh_match.group(1)) * 100000)
        except ValueError:
            pass

    # Extract digits
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
            "reasons": ["Scheme metadata unavailable"],
            "missing_information": [],
            "official_link": "https://india.gov.in"
        }

    name = scheme_meta["name"]
    category = scheme_meta["category"]
    official_link = scheme_meta["official_link"]

    age = profile.get("age")
    occupation = (profile.get("occupation") or "").strip().lower()
    income_num = profile.get("annual_income_numeric")
    income_str = profile.get("annual_income") or ""
    state = profile.get("state") or ""

    reasons: List[str] = []
    missing_info: List[str] = []
    status = "needs_more_information"

    sid = scheme_id.lower()

    # 1. PMJAY (Ayushman Bharat)
    if sid == "pmjay":
        if income_num is not None and income_num <= 500000:
            status = "eligible"
            reasons.append(f"Your annual income of {income_str} is within the EWS / healthcare support category")
        elif "student" in occupation or "farmer" in occupation or "worker" in occupation:
            status = "possible"
            reasons.append(f"Your occupation ({profile.get('occupation')}) qualifies under priority healthcare coverage categories")
            missing_info.append("SECC 2011 Deprivation Criteria / Ration Card Category verification")
        else:
            status = "needs_more_information"
            reasons.append("PMJAY covers families listed under SECC 2011 deprivation criteria or priority ration cards")
            missing_info.append("Ration Card / SECC Deprivation status")

    # 2. PMJJBY
    elif sid == "pmjjby":
        if age is not None:
            if 18 <= age <= 50:
                status = "eligible"
                reasons.append(f"Your age is {age} years, which is within the 18–50 entry age limit")
                reasons.append("Scheme provides ₹2 Lakh life insurance cover")
                missing_info.append("Savings Bank Account with auto-debit consent")
            else:
                status = "not_eligible"
                reasons.append(f"Your age is {age} years. PMJJBY is strictly for entry ages 18 to 50 years")
        else:
            status = "needs_more_information"
            reasons.append("Age calculation requires Date of Birth")
            missing_info.append("Date of Birth / Age verification")

    # 3. PMSBY
    elif sid == "pmsby":
        if age is not None:
            if 18 <= age <= 70:
                status = "eligible"
                reasons.append(f"Your age is {age} years, which satisfies the 18–70 age requirement")
                reasons.append("PMSBY provides ₹2 Lakh accidental death / disability insurance cover")
            else:
                status = "not_eligible"
                reasons.append(f"Your age is {age} years. PMSBY requires age between 18 and 70 years")
        else:
            status = "needs_more_information"
            reasons.append("Age verification required")
            missing_info.append("Date of Birth")

    # 4. PM-KISAN
    elif sid == "pm-kisan":
        if any(f in occupation for f in ["farmer", "agricultur", "landholder"]):
            status = "eligible"
            reasons.append(f"Your occupation is recorded as '{profile.get('occupation')}'")
            reasons.append("PM-KISAN provides ₹6,000 per year direct income support to landholding farmer families")
            missing_info.append("Institutional landholding & Non-taxpayer declaration")
        elif not occupation:
            status = "needs_more_information"
            reasons.append("PM-KISAN requires confirmation of landholding farmer status")
            missing_info.append("Farmer / Landholder occupation status")
        else:
            status = "not_eligible"
            reasons.append(f"Your recorded occupation is '{profile.get('occupation')}', whereas PM-KISAN is reserved for landholding farmers")

    # 5. PMKMY
    elif sid == "pmkmy":
        is_farmer = any(f in occupation for f in ["farmer", "agricultur"])
        if is_farmer:
            if age is not None and 18 <= age <= 40:
                status = "eligible"
                reasons.append(f"Your age is {age} years (within 18–40 range) and occupation is '{profile.get('occupation')}'")
                reasons.append("Guarantees minimum ₹3,000 monthly pension after age 60")
            elif age is not None:
                status = "not_eligible"
                reasons.append(f"Your age is {age} years. PMKMY entry age must be between 18 and 40 years")
            else:
                status = "needs_more_information"
                reasons.append("Farmer occupation verified, but age is missing")
                missing_info.append("Date of Birth")
        else:
            status = "not_eligible" if occupation else "needs_more_information"
            reasons.append("PMKMY is specifically designed for Small and Marginal Farmers")

    # 6. PMFBY
    elif sid == "pmfby":
        if any(f in occupation for f in ["farmer", "agricultur"]):
            status = "eligible"
            reasons.append(f"Your occupation '{profile.get('occupation')}' qualifies for crop loss insurance support")
        elif not occupation:
            status = "needs_more_information"
            missing_info.append("Farmer occupation & Crop Sowing Details")
        else:
            status = "not_eligible"
            reasons.append("PMFBY crop insurance applies only to farmers cultivating notified crops")

    # 7. NMMSS
    elif sid == "nmmss":
        is_student = "student" in occupation or not occupation
        if income_num is not None and income_num > 350000:
            status = "not_eligible"
            reasons.append(f"Your annual income of {income_str} exceeds the ₹3.5 Lakh eligibility limit for NMMSS")
        elif is_student:
            status = "possible" if income_num is not None else "needs_more_information"
            reasons.append("Scholarship provides ₹12,000/year for Class 9 to Class 12 students from weaker sections")
            missing_info.append("Class 9 Enrollment in Government / Aided school")
            missing_info.append("Class 8 Minimum 55% Marks certificate")
        else:
            status = "not_eligible"
            reasons.append("NMMSS is reserved for school students studying in Class 9")

    # 8. CSSS
    elif sid == "csss":
        is_student = "student" in occupation or not occupation
        if income_num is not None and income_num > 450000:
            status = "not_eligible"
            reasons.append(f"Your annual income of {income_str} exceeds the ₹4.5 Lakh limit for Central Sector Scholarship")
        elif is_student:
            status = "possible" if income_num is not None else "needs_more_information"
            reasons.append("Central Sector Scholarship supports meritorious college and university students")
            missing_info.append("Class 12 Board Percentile Rank (>80th percentile)")
            missing_info.append("Regular College / University course admission details")
        else:
            status = "not_eligible"
            reasons.append("Central Sector Scholarship is for regular college / university students")

    # 9. RTE EWS Quota
    elif sid == "rte":
        status = "possible"
        reasons.append("RTE provisions 25% free seats in private schools for entry-level children of EWS families")
        if state:
            reasons.append(f"Applies to state residence: {state}")
        missing_info.append("Child Age & Entry-level Class Admission (Pre-school / Class 1)")
        missing_info.append("State-specific EWS Income Certificate")

    # 10. PM-SYM
    elif sid == "pmsym":
        is_unorganized = any(u in occupation for u in ["worker", "labor", "labour", "vendor", "driver", "tailor", "artisan", "self", "craft"]) or not occupation
        monthly_est = (income_num / 12) if income_num else None
        
        if age is not None and (age < 18 or age > 40):
            status = "not_eligible"
            reasons.append(f"Your age is {age} years. PM-SYM entry age must be between 18 and 40 years")
        elif monthly_est is not None and monthly_est > 15000:
            status = "not_eligible"
            reasons.append(f"Estimated monthly income of ₹{int(monthly_est):,} exceeds the ₹15,000 limit for unorganized workers")
        elif is_unorganized and (age is None or 18 <= age <= 40):
            status = "eligible" if (age and monthly_est and monthly_est <= 15000) else "possible"
            reasons.append("Provides ₹3,000 guaranteed monthly pension after age 60 for unorganized workers")
            if age:
                reasons.append(f"Age {age} falls within the 18–40 entry window")
            missing_info.append("Unorganized worker category declaration")

    # 11. APY
    elif sid == "apy":
        if age is not None:
            if 18 <= age <= 40:
                status = "eligible"
                reasons.append(f"Your age is {age} years, which meets the 18–40 entry window for Atal Pension Yojana")
                reasons.append("Guarantees monthly pension from ₹1,000 to ₹5,000 after age 60")
                missing_info.append("Income Tax Payer declaration (taxpayers excluded)")
            else:
                status = "not_eligible"
                reasons.append(f"Your age is {age} years. Entry age for APY must be between 18 and 40 years")
        else:
            status = "needs_more_information"
            reasons.append("APY entry requires age verification")
            missing_info.append("Date of Birth")

    # 12. PM Vishwakarma
    elif sid == "pm-vishwakarma":
        artisan_trades = ["carpenter", "blacksmith", "sculptor", "goldsmith", "potter", "cobbler", "tailor", "weaver", "artisan", "craft"]
        if any(t in occupation for t in artisan_trades):
            status = "eligible"
            reasons.append(f"Your occupation '{profile.get('occupation')}' matches recognized PM Vishwakarma traditional artisan trades")
            reasons.append("Provides ₹3 Lakh collateral-free loan, ₹15,000 toolkit incentive, and skill training")
        elif age is not None and age >= 18:
            status = "possible"
            reasons.append("PM Vishwakarma supports 18 recognized traditional artisan and craftsperson trades")
            missing_info.append("Trade / Skill Verification under PM Vishwakarma list")
        else:
            status = "needs_more_information"
            missing_info.append("Age >= 18 verification & Artisan Trade enrollment")

    # 13. PM SVANidhi
    elif sid == "pmsvanidhi":
        if any(v in occupation for v in ["vendor", "hawker", "street"]):
            status = "eligible"
            reasons.append(f"Your occupation '{profile.get('occupation')}' qualifies for PM SVANidhi street vendor micro-loans")
            reasons.append("Provides collateral-free working capital loan starting at ₹10,000")
        elif not occupation:
            status = "needs_more_information"
            missing_info.append("Street Vendor / Hawker Certificate of Vending")
        else:
            status = "not_eligible"
            reasons.append("PM SVANidhi is specifically designed for Urban and Peri-Urban Street Vendors")

    # 14. PMAY
    elif sid == "pmay":
        if income_num is not None:
            if income_num <= 300000:
                status = "eligible"
                reasons.append(f"Annual income of {income_str} qualifies under Economically Weaker Section (EWS) category")
            elif income_num <= 600000:
                status = "eligible"
                reasons.append(f"Annual income of {income_str} qualifies under Low Income Group (LIG) category")
            else:
                status = "possible"
                reasons.append(f"Annual income of {income_str} falls in Middle Income Group (MIG) category")
        else:
            status = "possible"
            reasons.append("PMAY provides credit-linked interest subsidy for first-time pucca house construction")
            missing_info.append("Annual Income certificate & Ownership declaration")

    return {
        "id": scheme_meta["id"],
        "name": name,
        "category": category,
        "status": status,
        "reasons": reasons,
        "missing_information": missing_info,
        "official_link": official_link
    }
