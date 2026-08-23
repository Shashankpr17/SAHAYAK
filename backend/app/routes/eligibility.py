"""
eligibility.py — Router for Government Scheme Eligibility Evaluation
"""

from typing import Optional, Dict, Any
from fastapi import APIRouter, Header, Request, status
from app.services.auth import verify_access_token
from app.services import profile_service, eligibility_service

router = APIRouter(prefix="/api/eligibility", tags=["eligibility"])


@router.get(
    "",
    status_code=status.HTTP_200_OK,
    summary="Evaluate scheme eligibility for current user",
    response_description="Eligible, possible, and all schemes evaluation"
)
@router.get(
    "/",
    status_code=status.HTTP_200_OK,
    include_in_schema=False
)
def get_eligibility_endpoint(
    authorization: Optional[str] = Header(None)
):
    """
    Evaluate currently stored profile in Firestore against all government schemes.
    If no user token is provided, returns default citizen eligibility recommendations.
    """
    profile_dict: Dict[str, Any] = {}

    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ")[1]
        user_data = verify_access_token(token)
        if user_data and "google_sub" in user_data:
            google_sub = user_data["google_sub"]
            stored_profile = profile_service.get_profile(google_sub)
            if stored_profile:
                profile_dict = stored_profile.model_dump(mode="json")

    return eligibility_service.evaluate_eligibility_for_profile(profile_dict)


@router.post(
    "",
    status_code=status.HTTP_200_OK,
    summary="Evaluate scheme eligibility for provided profile payload",
    response_description="Scheme evaluation results for submitted payload"
)
@router.post(
    "/",
    status_code=status.HTTP_200_OK,
    include_in_schema=False
)
def post_eligibility_endpoint(payload: Dict[str, Any]):
    """Evaluate submitted profile object against all scheme rules."""
    return eligibility_service.evaluate_eligibility_for_profile(payload)
