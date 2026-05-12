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
    competences_pct: float = 0.60
    experience_pct: float = 0.40
    formation_pct: float = 0.00

#  Endpoint principal 

@router.post("/run")
async def run_assignment(
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

    # Validation que les pondérations somment à 1.0
    total = round(
        request.competences_pct +
        request.experience_pct +
        request.formation_pct, 2
    )
    if total != 1.0:
        raise HTTPException(
            status_code=400,
            detail=f"La somme des pondérations doit être 1.0 (reçu : {total})"
        )

    # Lancement de l'algorithme
    proposals = await run_matching(
        session_id=request.session_id,
        professors=request.professors,
        courses=request.courses,
        weights={
            "competences_pct": request.competences_pct,
            "experience_pct": request.experience_pct,
            "formation_pct": request.formation_pct,
        }
    )

    return {
        "session_id": request.session_id,
        "total_proposals": len(proposals),
        "assignments": proposals
    }