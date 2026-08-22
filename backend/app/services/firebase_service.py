import os
import json
from typing import Optional, Dict, Any
import firebase_admin
from firebase_admin import credentials, firestore
from fastapi import HTTPException, status

_db_client: Optional[firestore.client] = None


def get_firestore_client() -> firestore.client:
    """Initialize the Firebase Admin SDK once and return the Firestore client."""
    global _db_client
    if _db_client is not None:
        return _db_client

    creds_json = os.getenv("FIREBASE_CREDENTIALS_JSON")
    if not creds_json:
        # Fallback to local credential JSON path if set for testing, or default credentials
        creds_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
        if creds_path and os.path.exists(creds_path):
            try:
                if not firebase_admin._apps:
                    cred = credentials.Certificate(creds_path)
                    firebase_admin.initialize_app(cred)
                _db_client = firestore.client()
                return _db_client
            except Exception as e:
                print(f"[FIREBASE] Local credentials path initialization failed: {e}")

        # If no credentials found at all, raise a clear server configuration error
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Firebase credentials are not configured. Set FIREBASE_CREDENTIALS_JSON in environment variables."
        )

    try:
        creds_dict = json.loads(creds_json)
        cred = credentials.Certificate(creds_dict)
        # Avoid initializing multiple apps
        if not firebase_admin._apps:
            firebase_admin.initialize_app(cred)
        _db_client = firestore.client()
        return _db_client
    except Exception as e:
        print("[FIREBASE ERROR] Failed to initialize Firebase Admin SDK:", e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to initialize database connectivity."
        )


def get_user_doc(google_sub: str) -> Optional[Dict[str, Any]]:
    """Retrieve the user document from Firestore."""
    db = get_firestore_client()
    doc_ref = db.collection("users").document(google_sub)
    doc = doc_ref.get()
    if doc.exists:
        return doc.to_dict()
    return None


def save_user_doc(google_sub: str, data: Dict[str, Any]) -> None:
    """Save or update the user document in Firestore."""
    db = get_firestore_client()
    doc_ref = db.collection("users").document(google_sub)
    doc_ref.set(data, merge=True)
