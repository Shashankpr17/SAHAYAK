from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from services.db import init_db
from services.document_extractor.upload import router as upload_router
from services.document_extractor.ocr import router as ocr_router
from services.document_extractor.field_extractor import router as field_extractor_router
from routers.review import router as review_router
from routers.profile import router as profile_router
from routers.auth import router as auth_router
from schemes.router import router as schemes_router
from eligibility.router import router as eligibility_router
from language_engine.router import router as language_router

# Initialize SQLite Database tables
init_db()

app = FastAPI(
    title="SAHAYAK Backend",
    description="Backend service for SAHAYAK - Government services, made simple.",
    version="0.1.0"
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(upload_router)
app.include_router(ocr_router)
app.include_router(field_extractor_router)
app.include_router(review_router)
app.include_router(profile_router)
app.include_router(auth_router)
app.include_router(schemes_router)
app.include_router(eligibility_router)
app.include_router(language_router)

@app.get("/health")
def health_check():
    return {
        "status": "SAHAYAK backend is running"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
