"""
explain.py — Router for Scheme Vernacular Explanations
"""

from typing import Optional
from fastapi import APIRouter, Query, Header, HTTPException, status
from app.services.scheme_service import get_scheme_by_id

router = APIRouter(prefix="/api/explain", tags=["language"])


@router.get("/{scheme_id}")
def explain_scheme(
    scheme_id: str,
    language: str = Query("en", description="Target language code: en, hi, or"),
    simple: bool = Query(True, description="True for simplified explanation, False for formal details"),
    authorization: Optional[str] = Header(None)
):
    """
    GET /api/explain/{scheme_id}
    Returns official details and vernacular explanations for any supported scheme.
    """
    scheme = get_scheme_by_id(scheme_id)
    if not scheme:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Scheme with id '{scheme_id}' was not found."
        )

    return {
        "scheme_id": scheme["id"],
        "scheme_name": scheme["name"],
        "language": language,
        "simple": simple,
        "title": scheme["name"],
        "explanation": scheme["eligibility_criteria"],
        "how_to_get": scheme.get("application_information", "Apply online on official government portal."),
        "eligibility_explanation": scheme["eligibility_criteria"],
        "missing_information": [],
        "official_link": scheme["official_link"]
    }
