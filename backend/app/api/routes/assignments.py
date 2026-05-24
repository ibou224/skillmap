# assignments.py
# Endpoint FastAPI pour le lancement de l'algorithme d'affectation.
# Reçoit les paramètres d'une session et retourne les propositions
# d'affectation classées par score décroissant.

from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel, Field
from app.services.matching import run_matching
from app.core.config import settings

router = APIRouter()

#  Schéma de la requête

class RunAssignmentRequest(BaseModel):
    session_id: str = Field(min_length=1, description="Identifiant de la session académique")
    professors: list
    courses: list
    # Pondérations configurables  entre 0 et 1, somme doit être égale à 1.0
    skills_weight: float = Field(default=0.40, ge=0.0, le=1.0)
    experience_weight: float = Field(default=0.25, ge=0.0, le=1.0)
    education_weight: float = Field(default=0.20, ge=0.0, le=1.0)
    history_weight: float = Field(default=0.15, ge=0.0, le=1.0)

#  Endpoint principal

@router.post("/")
async def calculate_assignments(
    request: RunAssignmentRequest,
    x_internal_api_key: str = Header(...)
):
    """
    Lance l'algorithme d'affectation pondérée pour une session donnée.
    Retourne les propositions classées par score décroissant.
    """
    # Vérification de la clé API interne
    if x_internal_api_key != settings.internal_api_key:
        raise HTTPException(status_code=401, detail="Clé API invalide")

    weights_list = [
        request.skills_weight,
        request.experience_weight,
        request.education_weight,
        request.history_weight
    ]

    # Validation que les pondérations somment à 1.0
    total = round(sum(weights_list), 2)
    if total != 1.0:
        raise HTTPException(
            status_code=400,
            detail=f"La somme des pondérations doit être 1.0 (reçu : {total})"
        )

    # Avertissement si professors ou courses sont vides
    if not request.professors:
        raise HTTPException(
            status_code=400,
            detail="La liste des professeurs ne peut pas être vide"
        )
    if not request.courses:
        raise HTTPException(
            status_code=400,
            detail="La liste des cours ne peut pas être vide"
        )

    # Lancement de l'algorithme
    proposals = await run_matching(
        session_id=request.session_id,
        professors=request.professors,
        courses=request.courses,
        weights={
            "skills_weight": request.skills_weight,
            "experience_weight": request.experience_weight,
            "education_weight": request.education_weight,
            "history_weight": request.history_weight,
        }
    )

    return {
        "session_id": request.session_id,
        "total_proposals": len(proposals),
        "assignments": proposals
    }