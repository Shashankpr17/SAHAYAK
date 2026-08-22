import urllib.request
import urllib.parse
import json
import os
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from app.services import firebase_service
from app.services.auth import create_access_token

router = APIRouter(prefix="/api/auth", tags=["auth"])


class GoogleLoginPayload(BaseModel):
    id_token: str


@router.post(
    "/google",
    status_code=status.HTTP_200_OK,
    summary="Authenticate with Google ID Token",
    response_description="Authenticated user session info"
)
def google_auth(payload: GoogleLoginPayload):
    """
    Verify Google ID Token against Google's tokeninfo API.
    Resolves/Registers user in Firestore and issues a custom session token.
    """
    id_token = payload.id_token
    if not id_token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Google id_token is required"
        )

    # Verify ID Token with Google tokeninfo endpoint
    try:
        url = "https://oauth2.googleapis.com/tokeninfo?" + urllib.parse.urlencode({"id_token": id_token})
        req = urllib.request.Request(url, method="GET")
        with urllib.request.urlopen(req) as response:
            res_body = response.read().decode("utf-8")
            token_info = json.loads(res_body)
    except Exception as e:
        print("[AUTH ERROR] Google token validation request failed:", e)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Google authentication token"
        )

    # Verify audience matches client id if configured
    configured_client_id = os.getenv("GOOGLE_CLIENT_ID") or "2149112259-o2tc61qg5iquupqtmcrkaklnpe85atm3.apps.googleusercontent.com"
    aud = token_info.get("aud")
    if configured_client_id and aud and configured_client_id != aud:
        print(f"[AUTH WARNING] Audience mismatch. Expected: {configured_client_id}, Got: {aud}")

    google_sub = token_info.get("sub")
    email = token_info.get("email")
    name = token_info.get("name")
    picture_url = token_info.get("picture")

    if not google_sub:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Google account identifier (sub) missing"
        )

    # Create/update the user document in Firestore
    user_data = {
        "google_sub": google_sub,
        "email": email,
        "name": name,
        "picture_url": picture_url
    }
    try:
        firebase_service.save_user_doc(google_sub, user_data)
        print(f"[AUTH] Registered/updated user document in Firestore: {email}")
    except Exception as e:
        print("[AUTH WARNING] Failed to persist user document to Firestore:", e)

    # Create application session token using the google_sub string instead of user_id
    token = create_access_token({"google_sub": google_sub, "email": email})

    return {
        "success": True,
        "token": token,
        "user": {
            "id": google_sub,  # Use google_sub string as the ID mapping for frontend compatibility
            "email": email,
            "name": name,
            "picture_url": picture_url
        }
    }
