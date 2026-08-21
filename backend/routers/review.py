from typing import Optional
from fastapi import APIRouter, HTTPException, status, Header
from pydantic import BaseModel
from services.auth import verify_access_token
from services.document_extractor.field_extractor import (
    get_profile_from_storage,
    save_profile_to_storage,
)

router = APIRouter(prefix="/api", tags=["profile"])


class ProfileUpdateRequest(BaseModel):
    full_name: Optional[str] = None
    date_of_birth: Optional[str] = None
    state: Optional[str] = None
    address: Optional[str] = None
    annual_income: Optional[str] = None
    occupation: Optional[str] = None
    gender: Optional[str] = None
    father_name: Optional[str] = None
    mother_name: Optional[str] = None
    blood_group: Optional[str] = None
    aadhaar_number: Optional[str] = None
    pan_number: Optional[str] = None
    driving_licence_number: Optional[str] = None
    voter_id_number: Optional[str] = None
    district: Optional[str] = None
    pin_code: Optional[str] = None


@router.get("/profile")
def get_profile(authorization: Optional[str] = Header(None)):
    """Retrieve the currently extracted/stored profile data for the authenticated user."""
    user_id = 1
    if authorization:
        try:
            token = authorization.split(" ")[1]
            user_data = verify_access_token(token)
            if user_data and "user_id" in user_data:
                user_id = user_data["user_id"]
        except Exception:
            raise HTTPException(status_code=401, detail="Invalid authorization token")
            
    profile_data = get_profile_from_storage(user_id=user_id)
    return {
        "success": True,
        "data": profile_data
    }


@router.put("/profile")
def update_profile(payload: ProfileUpdateRequest, authorization: Optional[str] = Header(None)):
    """Update profile data after user editing on Review Details page."""
    user_id = 1
    if authorization:
        try:
            token = authorization.split(" ")[1]
            user_data = verify_access_token(token)
            if user_data and "user_id" in user_data:
                user_id = user_data["user_id"]
        except Exception:
            raise HTTPException(status_code=401, detail="Invalid authorization token")

    current = get_profile_from_storage(user_id=user_id)

    # Update only provided fields
    if payload.full_name is not None:
        current["full_name"] = payload.full_name
    if payload.date_of_birth is not None:
        current["date_of_birth"] = payload.date_of_birth
    if payload.state is not None:
        current["state"] = payload.state
    if payload.address is not None:
        current["address"] = payload.address
    if payload.annual_income is not None:
        current["annual_income"] = payload.annual_income
    if payload.occupation is not None:
        current["occupation"] = payload.occupation
    if payload.gender is not None:
        current["gender"] = payload.gender
    if payload.father_name is not None:
        current["father_name"] = payload.father_name
    if payload.mother_name is not None:
        current["mother_name"] = payload.mother_name
    if payload.blood_group is not None:
        current["blood_group"] = payload.blood_group
    if payload.aadhaar_number is not None:
        current["aadhaar_number"] = payload.aadhaar_number
    if payload.pan_number is not None:
        current["pan_number"] = payload.pan_number
    if payload.driving_licence_number is not None:
        current["driving_licence_number"] = payload.driving_licence_number
    if payload.voter_id_number is not None:
        current["voter_id_number"] = payload.voter_id_number
    if payload.district is not None:
        current["district"] = payload.district
    if payload.pin_code is not None:
        current["pin_code"] = payload.pin_code

    save_profile_to_storage(current, user_id=user_id)

    return {
        "success": True,
        "message": "Profile updated successfully",
        "data": current
    }
