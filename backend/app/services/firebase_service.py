import os
import json
import tempfile
from pathlib import Path
from typing import Optional, Dict, Any
import firebase_admin
from firebase_admin import credentials, firestore

_db_client: Optional[firestore.client] = None
_firebase_initialized: bool = False

# Local storage fallback directory & file
LOCAL_STORAGE_DIR = Path(__file__).resolve().parent.parent.parent / "storage"
try:
    LOCAL_STORAGE_DIR.mkdir(parents=True, exist_ok=True)
    LOCAL_USERS_FILE = LOCAL_STORAGE_DIR / "local_users.json"
except Exception:
    LOCAL_USERS_FILE = Path(tempfile.gettempdir()) / "sahayak_local_users.json"


def _read_local_users() -> Dict[str, Any]:
    if not LOCAL_USERS_FILE.exists():
        return {}
    try:
        with open(LOCAL_USERS_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return {}


def _write_local_users(data: Dict[str, Any]) -> None:
    try:
        LOCAL_USERS_FILE.parent.mkdir(parents=True, exist_ok=True)
        with open(LOCAL_USERS_FILE, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
    except Exception as e:
        print(f"[LOCAL STORAGE WARNING] Failed to write local users file: {e}")


def get_firestore_client_safe() -> Optional[firestore.client]:
    """
    Initialize Firebase Admin SDK if credentials exist.
    Returns None if not configured, allowing safe fallback to local storage.
    """
    global _db_client, _firebase_initialized
    if _db_client is not None:
        return _db_client

    if _firebase_initialized:
        return None

    creds_json = os.getenv("FIREBASE_CREDENTIALS_JSON")
    if not creds_json:
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

        # Firebase credentials not provided, use local fallback
        _firebase_initialized = True
        print("[STORAGE] FIREBASE_CREDENTIALS_JSON not configured. Using local JSON store fallback.")
        return None

    try:
        creds_dict = json.loads(creds_json)
        cred = credentials.Certificate(creds_dict)
        if not firebase_admin._apps:
            firebase_admin.initialize_app(cred)
        _db_client = firestore.client()
        return _db_client
    except Exception as e:
        print("[FIREBASE ERROR] Failed to initialize Firebase Admin SDK from JSON:", e)
        _firebase_initialized = True
        return None


def get_user_doc(google_sub: str) -> Optional[Dict[str, Any]]:
    """Retrieve the user document from Firestore or local storage fallback."""
    client = get_firestore_client_safe()
    if client is not None:
        try:
            doc_ref = client.collection("users").document(google_sub)
            doc = doc_ref.get()
            if doc.exists:
                return doc.to_dict()
            return None
        except Exception as e:
            print(f"[FIREBASE WARNING] Firestore read failed: {e}. Falling back to local store.")

    # Local fallback
    local_data = _read_local_users()
    return local_data.get(google_sub)


def save_user_doc(google_sub: str, data: Dict[str, Any]) -> None:
    """Save or update the user document in Firestore or local storage fallback."""
    client = get_firestore_client_safe()
    if client is not None:
        try:
            doc_ref = client.collection("users").document(google_sub)
            doc_ref.set(data, merge=True)
            return
        except Exception as e:
            print(f"[FIREBASE WARNING] Firestore write failed: {e}. Falling back to local store.")

    # Local fallback
    local_data = _read_local_users()
    current = local_data.get(google_sub, {})
    current.update(data)
    local_data[google_sub] = current
    _write_local_users(local_data)

