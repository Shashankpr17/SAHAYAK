import os
import hmac
import hashlib
import base64
import json
import time
from typing import Optional
from fastapi import Header, HTTPException, status

# Load SESSION_SECRET from environment (default to fallback for dev/testing)
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

def verify_access_token(token: str) -> Optional[dict]:
    """Validate token signature and expiration."""
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

def get_current_user_id(authorization: Optional[str] = Header(None)) -> int:
    """Dependency injection resolver to find authenticated user ID or fallback to User ID 1."""
    if not authorization:
        # Fallback for Chrome Extension backward compatibility (default user ID = 1)
        print("[AUTH WARNING] Action requested without Authorization header. Defaulting to User ID 1.")
        return 1
        
    try:
        if not authorization.startswith("Bearer "):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authorization header scheme. Use Bearer token."
            )
        token = authorization.split(" ")[1]
        user_data = verify_access_token(token)
        if not user_data or "user_id" not in user_data:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Session expired or invalid authentication token"
            )
        return user_data["user_id"]
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Malformed Authorization header format"
        )
