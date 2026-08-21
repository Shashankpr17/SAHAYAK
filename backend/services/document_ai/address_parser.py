"""
SAHAYAK Document AI — Address Intelligence Parser

Provides multi-level address parsing to extract district, state, PIN code,
and other geographic components from Indian addresses.

Levels:
    1. Use Gemini's structured address components directly
    2. Parse fullAddress string for embedded district/state/PIN
    3. Heuristic geographic parsing from comma-separated parts
    4. PIN code → state fallback using existing state_detector

Never hallucinate — leave empty if uncertain.
"""

import re
from typing import Dict, Any, Optional

# Import the existing state detector for PIN-to-state mapping
from services.document_extractor.state_detector import (
    detect_state_from_text,
    INDIAN_STATES,
    PIN_PREFIX_MAP,
)


# District label patterns (English + Hindi)
DISTRICT_PATTERNS = [
    r"(?:district|dist|distt|जिला)\s*[:\-–—.]?\s*([A-Za-z][A-Za-z\s]{2,25})",
    r"([A-Za-z][A-Za-z\s]{2,25})\s*(?:district|dist|distt|जिला)",
]

# Known Indian districts (common ones for faster matching)
COMMON_DISTRICTS = [
    "Begusarai", "Patna", "Gaya", "Muzaffarpur", "Darbhanga", "Bhagalpur",
    "Munger", "Saharsa", "Purnia", "Vaishali", "Nalanda", "Jehanabad",
    "Aurangabad", "Rohtas", "Buxar", "Bhojpur", "Saran", "Siwan",
    "Gopalganj", "Champaran", "Samastipur", "Madhubani", "Sitamarhi",
    "Lucknow", "Kanpur", "Agra", "Varanasi", "Prayagraj", "Allahabad",
    "Gorakhpur", "Bareilly", "Meerut", "Ghaziabad", "Noida",
    "Mumbai", "Pune", "Nagpur", "Thane", "Nashik", "Aurangabad",
    "Kolkata", "Howrah", "Hooghly", "Burdwan", "Midnapore", "Nadia",
    "Chennai", "Coimbatore", "Madurai", "Salem", "Tiruchirappalli",
    "Bengaluru", "Mysuru", "Hubli", "Mangalore", "Belgaum",
    "Hyderabad", "Warangal", "Karimnagar", "Nizamabad",
    "Jaipur", "Jodhpur", "Udaipur", "Kota", "Ajmer", "Bikaner",
    "Ahmedabad", "Surat", "Vadodara", "Rajkot", "Gandhinagar",
    "Bhubaneswar", "Cuttack", "Puri", "Sambalpur", "Berhampur",
    "Ranchi", "Jamshedpur", "Dhanbad", "Bokaro", "Hazaribagh", "Deoghar",
    "Chandigarh", "Ludhiana", "Amritsar", "Jalandhar", "Patiala",
    "Dehradun", "Haridwar", "Rishikesh", "Nainital", "Almora",
    "Shimla", "Kullu", "Manali", "Kangra", "Solan",
    "Guwahati", "Dibrugarh", "Silchar", "Jorhat", "Tezpur",
    "Thiruvananthapuram", "Kochi", "Kozhikode", "Thrissur", "Kollam",
    "Bhopal", "Indore", "Gwalior", "Jabalpur", "Ujjain",
    "Raipur", "Bilaspur", "Durg", "Korba", "Rajnandgaon",
]


def _extract_pin_code(text: str) -> Optional[str]:
    """Extract a 6-digit Indian PIN code from text."""
    if not text:
        return None
    match = re.search(r"\b(\d{6})\b", text)
    if match:
        pin = match.group(1)
        # Basic validation: Indian PINs start with 1-9
        if pin[0] != "0":
            return pin
    return None


def _extract_district_from_text(text: str) -> Optional[str]:
    """Extract district name using label patterns and known district list."""
    if not text:
        return None

    # Level 1: Explicit district label patterns
    for pattern in DISTRICT_PATTERNS:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            district = match.group(1).strip()
            # Clean trailing punctuation/numbers
            district = re.sub(r"[\d,\.\-]+$", "", district).strip()
            if len(district) >= 3:
                return district.title()

    # Level 2: Known district name matching
    text_lower = text.lower()
    for district in COMMON_DISTRICTS:
        if re.search(r"\b" + re.escape(district.lower()) + r"\b", text_lower):
            return district

    return None


def _extract_state_from_text(text: str) -> Optional[str]:
    """Extract Indian state name from text."""
    if not text:
        return None
    return detect_state_from_text(text)


def _parse_address_components(full_address: str) -> Dict[str, Optional[str]]:
    """
    Parse a full address string to extract district, state, and PIN code.
    
    Handles formats like:
    - "Ward No 13, Bithsari, PO Bith, District Begusarai, Bihar 851112"
    - "Village Rampur, PO XYZ, Begusarai, Bihar - 851112"
    - "S/O ABC, Plot 102, Saheed Nagar, Bhubaneswar, Odisha, PIN 751007"
    """
    result = {
        "district": None,
        "state": None,
        "pinCode": None,
        "village": None,
        "locality": None,
        "city": None,
    }

    if not full_address:
        return result

    # Extract PIN code
    result["pinCode"] = _extract_pin_code(full_address)

    # Extract district
    result["district"] = _extract_district_from_text(full_address)

    # Extract state
    result["state"] = _extract_state_from_text(full_address)

    # If state not found directly but PIN exists, use PIN-to-state mapping
    if not result["state"] and result["pinCode"]:
        result["state"] = _extract_state_from_text(result["pinCode"])

    # Try to extract village/locality/city from comma-separated parts
    parts = [p.strip() for p in full_address.split(",") if p.strip()]
    
    # Filter out parts that are already identified as district/state/PIN
    remaining_parts = []
    for part in parts:
        part_clean = part.strip()
        # Skip if it's the PIN code
        if result["pinCode"] and result["pinCode"] in part_clean:
            continue
        # Skip if it contains district label
        if re.search(r"\b(district|dist|distt|जिला)\b", part_clean, re.IGNORECASE):
            continue
        # Skip if it's the state name
        if result["state"] and result["state"].lower() in part_clean.lower():
            continue
        # Skip common non-geographic prefixes
        if re.search(r"^(s/o|d/o|w/o|c/o|son of|daughter of|wife of|care of)\b", part_clean, re.IGNORECASE):
            continue
        remaining_parts.append(part_clean)

    # Assign remaining parts heuristically
    if remaining_parts:
        # The last remaining part before state/district is likely the city
        if len(remaining_parts) >= 1:
            result["locality"] = remaining_parts[0] if len(remaining_parts) > 1 else None
            result["city"] = remaining_parts[-1] if remaining_parts else None

    return result


def enrich_address(profile: Dict[str, Any]) -> Dict[str, Any]:
    """
    Apply address intelligence to enrich a profile's address fields.
    
    If fullAddress exists but district/state/pinCode are empty, this function
    intelligently parses the address to fill those fields.
    
    Args:
        profile: The extracted profile dictionary with address fields.
        
    Returns:
        The enriched profile dictionary with populated address components.
    """
    full_address = profile.get("address") or ""
    current_district = profile.get("district") or ""
    current_state = profile.get("state") or ""
    current_pin = profile.get("pin_code") or ""

    # Only enrich if we have an address but missing components
    needs_enrichment = full_address and (not current_district or not current_state or not current_pin)

    if not needs_enrichment:
        # Even without enrichment, try PIN-to-state if state is missing
        if not current_state and current_pin:
            derived_state = _extract_state_from_text(current_pin)
            if derived_state:
                profile["state"] = derived_state
                print(f"[ADDRESS AI] Derived state from PIN code: {derived_state}")
        return profile

    print(f"[ADDRESS AI] Enriching address fields from: {full_address[:80]}...")

    parsed = _parse_address_components(full_address)

    # Fill missing district
    if not current_district and parsed["district"]:
        profile["district"] = parsed["district"]
        print(f"[ADDRESS AI] Derived district: {parsed['district']}")

    # Fill missing state
    if not current_state and parsed["state"]:
        profile["state"] = parsed["state"]
        print(f"[ADDRESS AI] Derived state: {parsed['state']}")

    # Fill missing PIN code
    if not current_pin and parsed["pinCode"]:
        profile["pin_code"] = parsed["pinCode"]
        print(f"[ADDRESS AI] Derived PIN code: {parsed['pinCode']}")

    # If state is STILL missing but we now have a PIN, try PIN-to-state
    if not profile.get("state") and profile.get("pin_code"):
        derived_state = _extract_state_from_text(profile["pin_code"])
        if derived_state:
            profile["state"] = derived_state
            print(f"[ADDRESS AI] Derived state from PIN code: {derived_state}")

    return profile
