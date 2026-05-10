from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings

# Initialisation de l'application FastAPI
app = FastAPI(
    title="SkillMap API",
    description="Parsing de CV et affectation automatique de professeurs",
    version="1.0.0"
)

# Configuration CORS et autorise le frontend Next.js à appeler l'API
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Route de test pour vérifier que l'API tourne
@app.get("/")
def root():
    return {"message": "SkillMap API opérationnelle"}