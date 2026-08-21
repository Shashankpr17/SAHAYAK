from fastapi import APIRouter, HTTPException, status
from schemes.service import get_all_schemes, get_scheme_by_id

router = APIRouter(prefix="/api/schemes", tags=["schemes"])


@router.get("")
@router.get("/")
def list_schemes():
    """GET /api/schemes - Return list of all government schemes."""
    return {
        "success": True,
        "count": len(get_all_schemes()),
        "data": get_all_schemes()
    }


@router.get("/{scheme_id}")
def get_scheme_detail(scheme_id: str):
    """GET /api/schemes/{scheme_id} - Return details for a single scheme."""
    scheme = get_scheme_by_id(scheme_id)
    if not scheme:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Scheme with ID '{scheme_id}' not found."
        )

    return {
        "success": True,
        "data": scheme
    }
