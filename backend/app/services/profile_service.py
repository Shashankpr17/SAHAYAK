from typing import Optional
from app.models.profile import Profile

# In-memory storage for development and testing
_current_profile: Optional[Profile] = None


def save_profile(profile: Profile) -> Profile:
    """Save the validated profile to storage."""
    global _current_profile
    _current_profile = profile
    return _current_profile


def get_profile() -> Optional[Profile]:
    """Retrieve the currently stored profile, or None if not set."""
    global _current_profile
    return _current_profile


def clear_profile() -> None:
    """Reset the currently stored profile."""
    global _current_profile
    _current_profile = None
