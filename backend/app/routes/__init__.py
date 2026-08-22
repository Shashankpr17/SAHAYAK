from app.routes.profile import router as profile_router
from app.routes.documents import router as documents_router
from app.routes.auth import router as auth_router

__all__ = ["profile_router", "documents_router", "auth_router"]
