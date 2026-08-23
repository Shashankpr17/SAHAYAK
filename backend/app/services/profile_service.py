from typing import Optional
from app.models.profile import Profile
from app.services import firebase_service


def save_profile(google_sub: str, profile: Profile) -> Profile:
    """Save user profile inside the Firestore user document under the 'profile' key."""
    profile_data = profile.model_dump(mode="json")
    
    # Save inside users/{google_sub} under the 'profile' field
    firebase_service.save_user_doc(
        google_sub=google_sub,
        data={"profile": profile_data}
    )
    return profile


def get_profile(google_sub: str) -> Optional[Profile]:
    """Retrieve user profile from the Firestore user document."""
    user_data = firebase_service.get_user_doc(google_sub)
    if user_data and "profile" in user_data:
        profile_dict = user_data["profile"]
        if profile_dict:
            # Pydantic validates and parses the dictionary fields correctly
            return Profile(**profile_dict)
    return None
