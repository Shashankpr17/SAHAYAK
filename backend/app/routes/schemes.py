"""
schemes.py — Router for Government Scheme Directory
"""

from fastapi import APIRouter, HTTPException, status
from app.services import scheme_service

router = APIRouter(prefix="/api/schemes", tags=["schemes"])


@router.get(
    "",
    status_code=status.HTTP_200_OK,
    summary="List all government schemes",
    response_description="Master list of all schemes"
)
@router.get(
    "/",
    status_code=status.HTTP_200_OK,
    include_in_schema=False
)
def list_schemes():
    """Return complete list of all supported government schemes."""
    schemes = scheme_service.get_all_schemes()
    return {
        "success": True,
        "count": len(schemes),
        "data": schemes
    }


@router.get(
    "/{scheme_id}",
    status_code=status.HTTP_200_OK,
    summary="Get single scheme details",
    response_description="Detailed scheme information"
)
def get_scheme(scheme_id: str):
    """Retrieve full details for a single scheme by identifier."""
    scheme = scheme_service.get_scheme_by_id(scheme_id)
    if not scheme:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Scheme with id '{scheme_id}' was not found."
        )
    return {
        "success": True,
        "data": scheme
    }
