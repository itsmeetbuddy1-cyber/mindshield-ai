import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.api.routes import router
from app.core.database import engine, Base, SessionLocal
from app.models import models

# Create database tables
Base.metadata.create_all(bind=engine)

# Initialize single user for demo purposes if not exists
db = SessionLocal()
if not db.query(models.User).filter_by(id=1).first():
    db.add(models.User(id=1, username="demo_user"))
    db.commit()
db.close()

app = FastAPI(title="MindShield AI", description="MindShield AI Unified Full-Stack Platform")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API routes
app.include_router(router)

@app.get("/api/health")
def health_check():
    return {"status": "ok", "app": "MindShield AI"}

# Mount frontend dist static assets if available
dist_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "dist"))
assets_dir = os.path.join(dist_dir, "assets")

if os.path.exists(assets_dir):
    app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

# Root route for SPA
@app.get("/")
async def root():
    index_file = os.path.join(dist_dir, "index.html")
    if os.path.exists(index_file):
        return FileResponse(index_file)
    return {"message": "MindShield AI API is active. Frontend build not found."}

# SPA catch-all route for frontend routes like /dashboard, /demo, etc.
@app.get("/{full_path:path}")
async def serve_spa(full_path: str):
    file_path = os.path.join(dist_dir, full_path)
    if os.path.isfile(file_path):
        return FileResponse(file_path)
    index_file = os.path.join(dist_dir, "index.html")
    if os.path.exists(index_file):
        return FileResponse(index_file)
    return {"message": "MindShield AI API is active. Frontend build not found."}
