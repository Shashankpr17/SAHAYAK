from typing import Optional
from fastapi import APIRouter, Query, Header
from services.auth import verify_access_token
from language_engine.service import get_simplified_explanation

router = APIRouter(prefix="/api/explain", tags=["language"])


@router.get("/{scheme_id}")
def explain_scheme(
    scheme_id: str,
    language: str = Query("en", description="Target language code: en, hi, or"),
    simple: bool = Query(True, description="True for simplified explanation, False for formal details"),
    authorization: Optional[str] = Header(None)
):
    """
    GET /api/explain/{scheme_id}
    Returns personalized scheme explanations or official details, translated to en, hi, or or (Odia).
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

    explanation_res = get_simplified_explanation(scheme_id, language, simple, user_id=user_id)
    return explanation_res
