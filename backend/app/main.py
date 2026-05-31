# main.py
# Point d'entrée de l'application FastAPI SkillMap.
# Configure le CORS et enregistre toutes les routes.

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.routes import cv, assignments
from datetime import datetime, timezone

# Initialisation de l'application FastAPI
app = FastAPI(
    title="SkillMap API",
    description="Parsing de CV et affectation automatique de professeurs",
    version="1.0.0"
)

#  CORS 
# Autorise le frontend Next.js à appeler l'API FastAPI
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

#  Routes 
app.include_router(cv.router, prefix="/analyze-cv", tags=["CV"])
app.include_router(assignments.router, prefix="/calculate-assignments", tags=["Affectations"])

#  Routes de base
@app.get("/")
def root():
    return {"message": "SkillMap API opérationnelle"}

@app.get("/health", tags=["Santé"])
def health():
    """Health check utilisé par Docker Compose et les load balancers."""
    return {"status": "ok", "timestamp": datetime.now(timezone.utc).isoformat()}