# -*- coding: utf-8 -*-
import re
from typing import Dict, Any, List, Optional
from schemes.service import get_scheme_by_id
from eligibility.scheme_rules import evaluate_scheme_rules, calculate_age_from_dob, parse_annual_income_numeric
from services.document_extractor.field_extractor import get_profile_from_storage
from language_engine.translations import SCHEME_EXPLANATIONS

# Local dictionary mapping for standard messages
VARS_TRANSLATIONS = {
    "en": {
        "eligible": "You qualify because: {reasons}",
        "possible": "You may qualify! We need to verify: {reasons}",
        "needs_info": "We need additional details to confirm eligibility: {missing}",
        "not_eligible": "You are not eligible: {reasons}",
        "age_missing": "Age verification is required.",
        "dob_missing": "Date of Birth",
        "bank_missing": "Savings Bank Account / Passbook details",
        "land_missing": "Land Possession Certificate / Revenue Records",
        "income_missing": "Family Income Certificate",
        "ration_missing": "Ration Card or Family registration"
    },
    "hi": {
        "eligible": "आप पात्र हैं क्योंकि: {reasons}",
        "possible": "आप पात्र हो सकते हैं! हमें इसकी पुष्टि करनी होगी: {reasons}",
        "needs_info": "पात्रता सुनिश्चित करने के लिए कुछ और जानकारी चाहिए: {missing}",
        "not_eligible": "आप पात्र नहीं हैं: {reasons}",
        "age_missing": "आयु सत्यापन आवश्यक है।",
        "dob_missing": "जन्म तिथि / आयु प्रमाण पत्र",
        "bank_missing": "बचत बैंक खाता / पासबुक विवरण",
        "land_missing": "भूमि कब्जा प्रमाण पत्र / राजस्व रिकॉर्ड",
        "income_missing": "पारिवारिक आय प्रमाण पत्र",
        "ration_missing": "राशन कार्ड या परिवार पंजीकरण"
    },
    "or": {
        "eligible": "ଆପଣ ଯୋଗ୍ୟ ଅଟନ୍ତି କାରଣ: {reasons}",
        "possible": "ଆପଣ ଯୋଗ୍ୟ ହୋଇପାରନ୍ତି! ଆମକୁ ଯାଞ୍ଚ କରିବାକୁ ହେବ: {reasons}",
        "needs_info": "ଯୋଗ୍ୟତା ନିଶ୍ଚିତ କରିବାକୁ ଅଧିକ ବିବରଣୀ ଆବଶ୍ୟକ: {missing}",
        "not_eligible": "ଆପଣ ଯୋଗ୍ୟ ନୁହଁନ୍ତି: {reasons}",
        "age_missing": "ବୟସ ଯାଞ୍ଚ ଆବଶ୍ୟକ ଅଟେ |",
        "dob_missing": "ଜନ୍ମ ତାରିଖ",
        "bank_missing": "ସଞ୍ଚୟ ବ୍ୟାଙ୍କ ଖାତା ବିବରଣୀ",
        "land_missing": "ଜମି ପଟ୍ଟା / ମାଲିକାନା ରେକର୍ଡ",
        "income_missing": "ଆୟ ପ୍ରମାଣପତ୍ର",
        "ration_missing": "ରାସନ କାର୍ଡ କିମ୍ବା ପରିବାର ପଞ୍ջୀକରଣ"
    }
}


def translate_reason(reason: str, lang: str) -> str:
    """Translate standard eligibility reasons using templates."""
    if lang == "en":
        return reason

    # Simple mapping replacements
    # "Your age is 21 years" -> "आपकी आयु 21 वर्ष है" / "ଆପଣଙ୍କ ବୟସ 21 ବର୍ଷ ଅଟେ"
    age_match = re.search(r"Your age is (\d+)", reason)
    if age_match:
        age_val = age_match.group(1)
        if lang == "hi":
            return f"आपकी आयु {age_val} वर्ष है"
        if lang == "or":
            return f"ଆପଣଙ୍କ ବୟସ {age_val} ବର୍ଷ ଅଟେ"

    # "Occupation matches" -> "पेशा मेल खाता है"
    if "Occupation matches" in reason:
        if lang == "hi": return "आपका पेशा / व्यवसाय योजना मानदंडों से मेल खाता है"
        if lang == "or": return "ଆପଣଙ୍କ ପେସା ଯୋଜନା ସହ ମେଳ ଖାଉଛି"

    # "Your occupation is recorded as" -> "आपका पेशा है..."
    occ_match = re.search(r"Your occupation is (?:recorded as )?'([^']+)'", reason)
    if occ_match:
        occ_val = occ_match.group(1)
        # translate worker, student, farmer
        if "student" in occ_val.lower():
            t_occ = "छात्र" if lang == "hi" else "ଛାତ୍ର"
        elif "teacher" in occ_val.lower():
            t_occ = "शिक्षक" if lang == "hi" else "ଶିକ୍ଷକ"
        elif "farmer" in occ_val.lower():
            t_occ = "किसान" if lang == "hi" else "ଚାଷୀ"
        else:
            t_occ = occ_val

        if lang == "hi": return f"आपका पेशा '{t_occ}' है"
        if lang == "or": return f"ଆପଣଙ୍କ ପେସା '{t_occ}' ଅଟେ"

    # "Annual income of ₹ 2,50,000" -> "वार्षिक आय..."
    income_match = re.search(r"Annual income of ([^ ]+)", reason)
    if income_match:
        inc_val = income_match.group(1)
        if lang == "hi": return f"वार्षिक आय {inc_val} सीमा के भीतर है"
        if lang == "or": return f"ବାର୍ଷିକ ଆୟ {inc_val} ସୀମା ମଧ୍ୟରେ ଅଛି"

    return reason


def translate_missing_info(info: str, lang: str) -> str:
    """Translate missing information fields."""
    if lang == "en":
        return info

    lc = lang.lower()
    keys = VARS_TRANSLATIONS.get(lc, VARS_TRANSLATIONS["en"])

    # Key phrase matching
    if "date of birth" in info.lower() or "age" in info.lower():
        return keys["dob_missing"]
    if "bank account" in info.lower():
        return keys["bank_missing"]
    if "land" in info.lower():
        return keys["land_missing"]
    if "income" in info.lower():
        return keys["income_missing"]
    if "ration" in info.lower():
        return keys["ration_missing"]

    return info


def get_simplified_explanation(scheme_id: str, lang: str, simple: bool = True, user_id: Optional[int] = None) -> Dict[str, Any]:
    """
    Generate explanation for a scheme.
    If simple=True, returns personalized, easy-to-understand vernacular translation.
    If simple=False, returns standard translated details from schemes repository.
    """
    lc = lang.lower()
    if lc not in ["en", "hi", "or"]:
        lc = "en"  # Fallback to English

    scheme_meta = get_scheme_by_id(scheme_id)
    if not scheme_meta:
        return {
            "scheme_id": scheme_id,
            "scheme_name": scheme_id,
            "language": lc,
            "simple": simple,
            "title": "Scheme Not Found",
            "explanation": "No details are available for this scheme ID.",
            "eligibility_explanation": "Criteria could not be evaluated.",
            "missing_information": []
        }

    # Fetch stored profile and check eligibility rules
    profile = get_profile_from_storage(user_id=user_id)
    dob = profile.get("date_of_birth") or profile.get("dob")
    profile["age"] = calculate_age_from_dob(dob)
    profile["annual_income_numeric"] = parse_annual_income_numeric(profile.get("annual_income"))

    eval_res = evaluate_scheme_rules(scheme_id, profile)

    if not simple:
        # Formal details mode
        desc_text = scheme_meta["eligibility_criteria"]
        if lc == "hi":
            desc_text = f"पात्रता मानदंड: {scheme_meta['eligibility_criteria']}"
        elif lc == "or":
            desc_text = f"ଯୋଗ୍ୟତା ମାପଦଣ୍ଡ: {scheme_meta['eligibility_criteria']}"

        return {
            "scheme_id": scheme_id,
            "scheme_name": scheme_meta["name"],
            "language": lc,
            "simple": False,
            "title": scheme_meta["name"],
            "explanation": desc_text,
            "eligibility_explanation": " • " + "\n • ".join(scheme_meta["parameters_evaluated"]),
            "missing_information": [],
            "official_link": scheme_meta["official_link"]
        }

    # Simple explanation mode
    exp_data = SCHEME_EXPLANATIONS.get(scheme_id.lower())
    if not exp_data:
        exp_data = SCHEME_EXPLANATIONS.get("pm-kisan") # backup dummy

    lang_exp = exp_data.get(lc, exp_data["en"])

    title = lang_exp["title"]
    explanation = lang_exp["explanation"]
    how_to_get = lang_exp["how_to_get"]

    # Personalize eligibility explanations using translated reasons/missing info
    status = eval_res["status"]
    raw_reasons = eval_res["reasons"] or []
    raw_missing = eval_res["missing_information"] or []

    translated_reasons = [translate_reason(r, lc) for r in raw_reasons]
    translated_missing = [translate_missing_info(m, lc) for m in raw_missing]

    vars_lang = VARS_TRANSLATIONS.get(lc, VARS_TRANSLATIONS["en"])

    if status == "eligible":
        elig_exp = vars_lang["eligible"].format(reasons="; ".join(translated_reasons))
    elif status == "possible":
        elig_exp = vars_lang["possible"].format(reasons="; ".join(translated_reasons))
    elif status == "needs_more_information":
        elig_exp = vars_lang["needs_info"].format(missing=", ".join(translated_missing))
    else:
        elig_exp = vars_lang["not_eligible"].format(reasons="; ".join(translated_reasons))

    return {
        "scheme_id": scheme_id,
        "scheme_name": scheme_meta["name"],
        "language": lc,
        "simple": True,
        "title": title,
        "explanation": explanation,
        "how_to_get": how_to_get,
        "eligibility_explanation": elig_exp,
        "missing_information": translated_missing,
        "official_link": scheme_meta["official_link"]
    }
