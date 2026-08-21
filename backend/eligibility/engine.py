from typing import Dict, Any, List
from schemes.scheme_data import ALL_SCHEMES_DATA
from eligibility.scheme_rules import (
    calculate_age_from_dob,
    parse_annual_income_numeric,
    evaluate_scheme_rules,
)


def evaluate_eligibility_for_profile(raw_profile: Dict[str, Any]) -> Dict[str, Any]:
    """
    Main entry point for evaluating user profile against all schemes.
    Calculates age and numeric income automatically.
    Categorizes results into eligible, possible, needs_more_information, and not_eligible.
    """
    dob = raw_profile.get("date_of_birth") or raw_profile.get("dob")
    income_str = raw_profile.get("annual_income") or raw_profile.get("annualIncome")

    age = calculate_age_from_dob(dob)
    income_num = parse_annual_income_numeric(income_str)

    evaluated_profile = {
        "full_name": raw_profile.get("full_name") or raw_profile.get("fullName"),
        "date_of_birth": dob,
        "age": age,
        "state": raw_profile.get("state"),
        "address": raw_profile.get("address"),
        "annual_income": income_str,
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

        status = result["status"]
        if status == "eligible":
            eligible_schemes.append(result)
        elif status == "possible":
            possible_schemes.append(result)
        elif status == "needs_more_information":
            needs_more_info.append(result)
        elif status == "not_eligible":
            # Keep in all_evaluations
            pass

    return {
        "profile": evaluated_profile,
        "eligible_schemes": eligible_schemes,
        "possible_schemes": possible_schemes,
        "needs_more_information": needs_more_info,
        "all_schemes": all_evaluations
    }
