import os
import hmac
import hashlib
import base64
import json
import time
from typing import Optional
from fastapi import Header, HTTPException, status
from app.services import firebase_service

# Load SESSION_SECRET from environment (default to fallback for development)
SECRET_KEY = os.getenv("SESSION_SECRET", "sahayak_secret_key_change_me_in_production_12345").encode('utf-8')


def create_access_token(data: dict) -> str:
    """Generate signature-verified access token using HMAC-SHA256."""
    payload = {
        "data": data,
        "exp": time.time() + 7 * 24 * 3600  # 7 days expiration
    }
    payload_bytes = json.dumps(payload).encode('utf-8')
    payload_b64 = base64.urlsafe_b64encode(payload_bytes).decode('utf-8')

    signature = hmac.new(SECRET_KEY, payload_b64.encode('utf-8'), hashlib.sha256).digest()
    signature_b64 = base64.urlsafe_b64encode(signature).decode('utf-8')

    return f"{payload_b64}.{signature_b64}"


def get_or_create_guest_user(guest_id: str) -> str:
    """Resolve or register a guest mode user in Firestore."""
    google_sub = f"guest:{guest_id}"
    try:
        user_data = firebase_service.get_user_doc(google_sub)
        if not user_data:
            firebase_service.save_user_doc(
                google_sub=google_sub,
                data={
                    "google_sub": google_sub,
                    "email": "guest@sahayak.local",
                    "name": "Guest User",
                    "picture_url": ""
                }
            )
            print(f"[AUTH] Registered new Firestore Guest user: {google_sub}")
    except Exception as e:
        print("[AUTH ERROR] Failed to resolve guest user in Firestore:", e)
        # Keep execution going if connection details are offline during validation
    return google_sub


def verify_access_token(token: str) -> Optional[dict]:
    """Validate token signature and expiration."""
    if not token:
        return None

    if token.startswith("guest_"):
        try:
            google_sub = get_or_create_guest_user(token)
            return {"google_sub": google_sub, "email": "guest@sahayak.local"}
        except Exception as e:
            print("[AUTH WARNING] Failed to sync guest user to Firestore, proceeding with offline guest id:", e)
            return {"google_sub": f"guest:{token}", "email": "guest@sahayak.local"}

    try:
        parts = token.split('.')
        if len(parts) != 2:
            return None
        payload_b64, signature_b64 = parts

        # Verify signature
        expected_sig = hmac.new(SECRET_KEY, payload_b64.encode('utf-8'), hashlib.sha256).digest()
        expected_sig_b64 = base64.urlsafe_b64encode(expected_sig).decode('utf-8')

        if not hmac.compare_digest(signature_b64, expected_sig_b64):
            return None

        # Decode and load payload
        payload_bytes = base64.urlsafe_b64decode(payload_b64.encode('utf-8'))
        payload = json.loads(payload_bytes.decode('utf-8'))

        # Check expiry
        if time.time() > payload["exp"]:
            return None

        return payload["data"]
    except Exception:
        return None


def get_current_user_sub(authorization: Optional[str] = Header(None)) -> str:
    """Dependency injection resolver to find authenticated user's google_sub."""
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization header is required"
        )

    try:
        if not authorization.startswith("Bearer "):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authorization header scheme. Use Bearer token."
            )
        token = authorization.split(" ")[1]
        user_data = verify_access_token(token)
        if not user_data or "google_sub" not in user_data:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Session expired or invalid authentication token"
            )
        return user_data["google_sub"]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Authentication failed: {str(e)}"
        )
