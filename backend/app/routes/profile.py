from fastapi import APIRouter, HTTPException, status
from app.models.profile import Profile
from app.services import profile_service

router = APIRouter(prefix="/api/profile", tags=["profile"])


@router.post(
    "",
    status_code=status.HTTP_200_OK,
    summary="Save validated user profile",
    response_description="Profile saved successfully"
)
@router.post(
    "/",
    status_code=status.HTTP_200_OK,
    include_in_schema=False
)
def save_profile_endpoint(profile: Profile):
    """
    Save or update the validated SAHAYAK user profile.
    Accepts full or partial profile data matching the canonical Profile schema.
    """
    saved_profile = profile_service.save_profile(profile)
    return {
        "success": True,
        "message": "Profile saved successfully",
        "profile": saved_profile
    }


@router.get(
    "",
    status_code=status.HTTP_200_OK,
    summary="Retrieve stored user profile",
    response_description="Currently stored profile data"
)
@router.get(
    "/",
    status_code=status.HTTP_200_OK,
    include_in_schema=False
)
def get_profile_endpoint():
    """
    Retrieve the currently stored SAHAYAK user profile.
    Returns 404 if no profile has been saved yet.
    """
    current_profile = profile_service.get_profile()
    if current_profile is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found"
        )
    return {
        "success": True,
        "profile": current_profile
    }
