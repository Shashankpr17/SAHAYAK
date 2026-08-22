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

app = FastAPI(
    title="SAHAYAK Backend API",
    version="1.0.0"
)

# Configure CORS
allowed_origins_env = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:5174,http://127.0.0.1:5173")
origins = [origin.strip() for origin in allowed_origins_env.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Profile Router
app.include_router(profile_router)


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
