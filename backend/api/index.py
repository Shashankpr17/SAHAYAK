import os
import sys
from pathlib import Path

# Ensure backend root is in sys.path for serverless/local execution
backend_root = Path(__file__).resolve().parent.parent
if str(backend_root) not in sys.path:
    sys.path.insert(0, str(backend_root))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.profile import router as profile_router
from app.routes.documents import router as documents_router
from app.routes.auth import router as auth_router
from app.routes.schemes import router as schemes_router
from app.routes.eligibility import router as eligibility_router
from app.routes.explain import router as explain_router

app = FastAPI(
    title="SAHAYAK Backend API",
    version="1.0.0"
)

# Configure CORS
allowed_origins_env = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:5173,http://localhost:5174,http://127.0.0.1:5173,"
    "https://sahayak-seven-rho.vercel.app,"
    "https://sahayak-d7xs.vercel.app,"
    "https://sahayak-d7xs-do1r7l0xa-shashankpr17s-projects.vercel.app"
)
origins = [origin.strip() for origin in allowed_origins_env.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(profile_router)
app.include_router(documents_router)
app.include_router(auth_router)
app.include_router(schemes_router)
app.include_router(eligibility_router)
app.include_router(explain_router)


@app.get("/")
def read_root():
    return {
        "message": "SAHAYAK Backend API"
    }


@app.get("/api/health")
def health_check():
    return {
        "status": "ok",
        "message": "SAHAYAK backend is running"
    }
