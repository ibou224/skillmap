# assignments.py
# Endpoint FastAPI pour le lancement de l'algorithme d'affectation.
# Reçoit les paramètres d'une session et retourne les propositions
# d'affectation classées par score décroissant.

from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel
from app.services.matching import run_matching
from app.core.config import settings

router = APIRouter()

#  Schéma de la requête

class RunAssignmentRequest(BaseModel):
    session_id: str
    professors: list
    courses: list
    # Pondérations configurables par le RH (doivent sommer à 1.0)
    skills_weight: float = 0.40
    experience_weight: float = 0.25
    education_weight: float = 0.20
    history_weight: float = 0.15

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

    # Validation session_id non vide
    if not request.session_id or not request.session_id.strip():
        raise HTTPException(
            status_code=400,
            detail="session_id ne peut pas être vide"
        )

    # Validation pondérations non négatives
    weights_list = [
        request.skills_weight,
        request.experience_weight,
        request.education_weight,
        request.history_weight
    ]
    if any(w < 0 for w in weights_list):
        raise HTTPException(
            status_code=400,
            detail="Les pondérations ne peuvent pas être négatives"
        )

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