import urllib.request
import urllib.parse
import json
import os
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from services.db import get_db_connection
from services.auth import create_access_token

router = APIRouter(prefix="/api/auth", tags=["auth"])

class GoogleLoginPayload(BaseModel):
    id_token: str

@router.post("/google")
def google_auth(payload: GoogleLoginPayload):
    id_token = payload.id_token
    if not id_token:
        raise HTTPException(status_code=400, detail="Google id_token is required")
        
    # Verify ID Token with Google tokeninfo endpoint
    try:
        url = "https://oauth2.googleapis.com/tokeninfo?" + urllib.parse.urlencode({"id_token": id_token})
        req = urllib.request.Request(url, method="GET")
        with urllib.request.urlopen(req) as response:
            res_body = response.read().decode("utf-8")
            token_info = json.loads(res_body)
    except Exception as e:
        print("[AUTH ERROR] Google token validation request failed:", e)
        raise HTTPException(status_code=401, detail="Invalid Google authentication token")
        
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
        raise HTTPException(status_code=401, detail="Google account identifier (sub) missing")
        
    # Connect to SQLite to search or create User
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM users WHERE google_sub = ?", (google_sub,))
    user = cursor.fetchone()
    
    if not user:
        cursor.execute(
            "INSERT INTO users (google_sub, email, name, picture_url) VALUES (?, ?, ?, ?)",
            (google_sub, email, name, picture_url)
        )
        conn.commit()
        cursor.execute("SELECT * FROM users WHERE google_sub = ?", (google_sub,))
        user = cursor.fetchone()
        print(f"[AUTH] Registered new SAHAYAK user: {email} ({name})")
    else:
        cursor.execute(
            "UPDATE users SET email = ?, name = ?, picture_url = ? WHERE id = ?",
            (email, name, picture_url, user["id"])
        )
        conn.commit()
        cursor.execute("SELECT * FROM users WHERE id = ?", (user["id"],))
        user = cursor.fetchone()
        print(f"[AUTH] Authenticated existing user: {email}")
        
    user_id = user["id"]
    conn.close()
    
    # Create application session token
    token = create_access_token({"user_id": user_id, "email": email})
    
    return {
        "success": True,
        "token": token,
        "user": {
            "id": user_id,
            "email": email,
            "name": name,
            "picture_url": picture_url
        }
    }
