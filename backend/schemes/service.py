from typing import List, Dict, Any, Optional
from schemes.scheme_data import ALL_SCHEMES_DATA


def get_all_schemes() -> List[Dict[str, Any]]:
    """Return list of all schemes."""
    return ALL_SCHEMES_DATA


def get_scheme_by_id(scheme_id: str) -> Optional[Dict[str, Any]]:
    """Return scheme detail object for a given scheme ID."""
    for scheme in ALL_SCHEMES_DATA:
        if scheme["id"].lower() == scheme_id.lower():
            return scheme
    return None
