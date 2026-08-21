# -*- coding: utf-8 -*-
import re
from typing import Optional

# List of Indian states & UTs for matching
INDIAN_STATES = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
    "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
    "Nagaland", "Odisha", "Orissa", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
    "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
    "Delhi", "New Delhi", "Chandigarh", "Puducherry", "Ladakh", "Jammu & Kashmir"
]

# PIN Code ranges mapping to major states (hackathon MVP)
# First 2 digits of PIN code
PIN_PREFIX_MAP = {
    "11": "Delhi",
    "12": "Haryana",
    "13": "Haryana",
    "14": "Punjab",
    "15": "Punjab",
    "16": "Chandigarh",
    "17": "Himachal Pradesh",
    "18": "Jammu & Kashmir",
    "19": "Jammu & Kashmir",
    
    "20": "Uttar Pradesh",
    "21": "Uttar Pradesh",
    "22": "Uttar Pradesh",
    "23": "Uttar Pradesh",
    "24": "Uttar Pradesh", # 246-249 Uttarakhand, handled dynamically
    "25": "Uttar Pradesh",
    "26": "Uttar Pradesh",
    "27": "Uttar Pradesh",
    "28": "Uttar Pradesh",
    
    "30": "Rajasthan",
    "31": "Rajasthan",
    "32": "Rajasthan",
    "33": "Rajasthan",
    "34": "Rajasthan",
    
    "36": "Gujarat",
    "37": "Gujarat",
    "38": "Gujarat",
    "39": "Gujarat",
    
    "40": "Maharashtra", # 403 Goa, handled dynamically
    "41": "Maharashtra",
    "42": "Maharashtra",
    "43": "Maharashtra",
    "44": "Maharashtra",
    
    "45": "Madhya Pradesh",
    "46": "Madhya Pradesh",
    "47": "Madhya Pradesh",
    "48": "Madhya Pradesh",
    "49": "Chhattisgarh",
    
    "50": "Telangana",
    "51": "Andhra Pradesh",
    "52": "Andhra Pradesh",
    "53": "Andhra Pradesh",
    
    "56": "Karnataka",
    "57": "Karnataka",
    "58": "Karnataka",
    "59": "Karnataka",
    
    "60": "Tamil Nadu", # 605 Puducherry, handled dynamically
    "61": "Tamil Nadu",
    "62": "Tamil Nadu",
    "63": "Tamil Nadu",
    "64": "Tamil Nadu",
    
    "67": "Kerala",
    "68": "Kerala",
    "69": "Kerala",
    
    "70": "West Bengal",
    "71": "West Bengal",
    "72": "West Bengal",
    "73": "West Bengal",
    "74": "West Bengal", # 744 Andaman & Nicobar, handled dynamically
    
    "75": "Odisha",
    "76": "Odisha",
    "77": "Odisha",
    
    "78": "Assam",
    "79": "Assam", # North East states (790-798), handled dynamically
    
    "80": "Bihar",
    "81": "Bihar", # 812-813 Jharkhand, handled dynamically
    "82": "Bihar", # 825-829 Jharkhand, handled dynamically
    "83": "Jharkhand",
    "84": "Bihar",
    "85": "Bihar",
}


def levenshtein_distance(s1: str, s2: str) -> int:
    """Calculate the Levenshtein distance between two strings."""
    if len(s1) < len(s2):
        return levenshtein_distance(s2, s1)
    if len(s2) == 0:
        return len(s1)
        
    prev = range(len(s2) + 1)
    for i, c1 in enumerate(s1):
        curr = [i + 1]
        for j, c2 in enumerate(s2):
            ins = prev[j + 1] + 1
            dels = curr[j] + 1
            subs = prev[j] + (c1 != c2)
            curr.append(min(ins, dels, subs))
        prev = curr
    return prev[-1]


def detect_state_by_fuzzy(text: str) -> Optional[str]:
    """Scan text to perform controlled fuzzy matching against Indian states."""
    normalized = re.sub(r"[^A-Za-z\s]", " ", text)
    words = [w.strip() for w in normalized.split() if len(w.strip()) >= 4]
    
    best_state = None
    best_ratio = 0.0
    
    for state in INDIAN_STATES:
        state_lower = state.lower()
        
        # Match single words
        for word in words:
            word_lower = word.lower()
            dist = levenshtein_distance(word_lower, state_lower)
            ratio = 1.0 - (dist / max(len(word_lower), len(state_lower)))
            if ratio >= 0.75 and ratio > best_ratio:
                best_ratio = ratio
                best_state = state
                
        # Match word pairs for multi-word states (e.g. West Bengal)
        for i in range(len(words) - 1):
            pair = f"{words[i]} {words[i+1]}".lower()
            dist = levenshtein_distance(pair, state_lower)
            ratio = 1.0 - (dist / max(len(pair), len(state_lower)))
            if ratio >= 0.75 and ratio > best_ratio:
                best_ratio = ratio
                best_state = state
                
    if best_ratio >= 0.75 and best_state:
        if best_state.lower() == "orissa":
            return "Odisha"
        return best_state
    return None


def detect_state_from_text(text: str) -> Optional[str]:
    """
    Intelligently detect Indian State using fallbacks:
    1. Direct scan for exact state names.
    2. Controlled fuzzy matching for misspelled state names.
    3. Fallback to PIN code prefix mapping.
    """
    if not text or not text.strip():
        return None

    # 1. Search for explicit direct state names
    for state in INDIAN_STATES:
        pattern = r"\b" + re.escape(state) + r"\b"
        if re.search(pattern, text, re.IGNORECASE):
            return "Odisha" if state.lower() == "orissa" else state

    # 2. Controlled fuzzy match
    fuzzy_state = detect_state_by_fuzzy(text)
    if fuzzy_state:
        return fuzzy_state

    # 3. Extract 6-digit PIN code and lookup mapping
    pin_state = None
    pin_match = re.search(r"\b(\d{6})\b", text)
    if pin_match:
        pin = pin_match.group(1)
        prefix2 = pin[:2]
        prefix3 = pin[:3]
        
        # Specific sub-range checks
        if prefix3 in ["246", "247", "248", "249"]:
            pin_state = "Uttarakhand"
        elif prefix3 == "403":
            pin_state = "Goa"
        elif prefix3 == "605":
            pin_state = "Puducherry"
        elif prefix3 == "744":
            pin_state = "Andaman & Nicobar"
        elif prefix3 in ["790", "791", "792"]:
            pin_state = "Arunachal Pradesh"
        elif prefix3 == "793":
            pin_state = "Meghalaya"
        elif prefix3 == "794":
            pin_state = "Meghalaya"
        elif prefix3 == "795":
            pin_state = "Manipur"
        elif prefix3 == "796":
            pin_state = "Mizoram"
        elif prefix3 == "797":
            pin_state = "Nagaland"
        elif prefix3 == "798":
            pin_state = "Nagaland"
        elif prefix3 == "799":
            pin_state = "Tripura"
        elif prefix3 in ["812", "813", "825", "826", "827", "828", "829"]:
            pin_state = "Jharkhand"
        else:
            pin_state = PIN_PREFIX_MAP.get(prefix2)

    if pin_state:
        return pin_state

    return None
