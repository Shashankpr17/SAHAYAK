from typing import Optional
from fastapi import APIRouter, Header
from services.auth import verify_access_token
from services.document_extractor.field_extractor import get_profile_from_storage
from eligibility.engine import evaluate_eligibility_for_profile

router = APIRouter(prefix="/api/eligibility", tags=["eligibility"])


@router.get("")
@router.get("/")
def get_eligibility(authorization: Optional[str] = Header(None)):
    """
    GET /api/eligibility
    Evaluate currently stored profile against all government schemes.
    Returns calculated age, categorized eligibility results, reasons, and missing info.
    """
    user_id = 1
    if authorization:
        try:
            token = authorization.split(" ")[1]
            user_data = verify_access_token(token)
            if user_data and "user_id" in user_data:
                user_id = user_data["user_id"]
        except Exception:
            pass

    profile_data = get_profile_from_storage(user_id=user_id)
    results = evaluate_eligibility_for_profile(profile_data)
    return {
        "success": True,
        **results
    }
