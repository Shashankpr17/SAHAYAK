from typing import Optional
from fastapi import APIRouter, HTTPException, status, Header
from pydantic import BaseModel
from services.auth import verify_access_token
from services.db import get_verified_profile, save_verified_profile

router = APIRouter(tags=["verified_profile"])


class VerifiedProfileModel(BaseModel):
    full_name: str
    date_of_birth: str
    state: str
    address: str
    annual_income: str
    occupation: str
    gender: Optional[str] = ""
    father_name: Optional[str] = ""
    mother_name: Optional[str] = ""
    blood_group: Optional[str] = ""
    aadhaar_number: Optional[str] = ""
    pan_number: Optional[str] = ""
    driving_licence_number: Optional[str] = ""
    voter_id_number: Optional[str] = ""
    district: Optional[str] = ""
    pin_code: Optional[str] = ""


@router.post("/profile")
def save_verified_profile_endpoint(payload: VerifiedProfileModel, authorization: Optional[str] = Header(None)):
    """Save the verified profile after user clicks Confirm & Continue."""
    user_id = 1
    if authorization:
        try:
            token = authorization.split(" ")[1]
            user_data = verify_access_token(token)
            if user_data and "user_id" in user_data:
                user_id = user_data["user_id"]
        except Exception:
            raise HTTPException(status_code=401, detail="Invalid authorization token")

    data = {
        "full_name": payload.full_name,
        "date_of_birth": payload.date_of_birth,
        "state": payload.state,
        "address": payload.address,
        "annual_income": payload.annual_income,
        "occupation": payload.occupation,
        "gender": payload.gender,
        "father_name": payload.father_name,
        "mother_name": payload.mother_name,
        "blood_group": payload.blood_group,
        "aadhaar_number": payload.aadhaar_number,
        "pan_number": payload.pan_number,
        "driving_licence_number": payload.driving_licence_number,
        "voter_id_number": payload.voter_id_number,
        "district": payload.district,
        "pin_code": payload.pin_code
    }
    print(f"[DEBUG VERIFIED PROFILE] Saving values to verified profile for user {user_id}: [Secured Name={payload.full_name}]")
    save_verified_profile(user_id, data)
    return {
        "success": True,
        "message": "Verified profile saved successfully",
        "profile": data
    }


@router.get("/profile")
def get_verified_profile_endpoint(authorization: Optional[str] = Header(None)):
    """Return the currently saved verified SAHAYAK profile for the authenticated user."""
    user_id = 1
    if authorization:
        try:
            token = authorization.split(" ")[1]
            user_data = verify_access_token(token)
            if user_data and "user_id" in user_data:
                user_id = user_data["user_id"]
        except Exception:
            raise HTTPException(status_code=401, detail="Invalid authorization token")

    profile_data = get_verified_profile(user_id)
    
    # Check if the profile contains any saved details
    is_empty = all(not v for v in profile_data.values())
    if is_empty:
        return {
            "success": False,
            "message": "No profile has been saved yet",
            "profile": None
        }
        
    return {
        "success": True,
        "profile": profile_data
    }
