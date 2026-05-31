# cv.py
# Endpoint FastAPI pour l'upload et l'analyse automatique des CV.
# Reçoit un fichier PDF ou Word, extrait le texte, appelle le LLM
# et sauvegarde les données en base PostgreSQL.

import os
import re
import uuid
from fastapi import APIRouter, UploadFile, File, HTTPException, Header
from app.services.parser import extract_text
from app.services.llm import extract_cv_data
from app.services.database import save_cv_extraction, save_professor_skills, professor_belongs_to_user
from app.core.config import settings

router = APIRouter()

# Types de fichiers acceptés
ALLOWED_TYPES = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
]

#  Endpoint principal

@router.post("/")
async def analyze_cv(
    file: UploadFile = File(...),
    x_internal_api_key: str = Header(...),
    professor_id: str = Header(None, alias="professor-id"),
    user_id: str = Header(None, alias="user-id")
):
    """
    Reçoit un CV (PDF ou Word), extrait le texte, appelle le LLM,
    sauvegarde les données en base et retourne les données structurées.
    """
    # ── Vérification de la clé API interne ───────────────────────────────────
    if x_internal_api_key != settings.internal_api_key:
        raise HTTPException(status_code=401, detail="Clé API invalide")

    # ── Vérification que professor_id appartient à user_id ───────────────────
    # Défense en profondeur : Next.js valide déjà cette relation, mais on
    # re-vérifie ici pour éviter toute manipulation de header en interne.
    if professor_id and user_id:
        if not professor_belongs_to_user(professor_id, user_id):
            raise HTTPException(
                status_code=403,
                detail="Accès refusé : ce profil professeur ne vous appartient pas."
            )

    # ── Vérification du format du fichier ────────────────────────────────────
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=400,
            detail="Format non supporté. PDF ou Word (.docx) uniquement."
        )

    # Lecture du contenu du fichier
    content = await file.read()

    # Extraction du texte brut avec messages d'erreur précis
    try:
        text = extract_text(content, file.content_type)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))

    if not text:
        raise HTTPException(
            status_code=422,
            detail="Impossible d'extraire le texte du fichier."
        )

    # Extraction des données structurées via le LLM
    cv_data = await extract_cv_data(text)

    #  Sauvegarde en base si professor_id fourni
    extraction_id = None
    if professor_id:
        try:
            # Sanitize le nom de fichier — neutralise path traversal et caractères spéciaux
            original_name = os.path.basename(file.filename or "cv.pdf")
            safe_name     = re.sub(r"[^A-Za-z0-9._-]", "_", original_name)[:120]
            unique_name   = f"{uuid.uuid4().hex}_{safe_name}"

            # Sauvegarder l'extraction CV
            extraction_id = save_cv_extraction(
                professor_id=professor_id,
                file_name=original_name,
                file_path=f"uploads/{professor_id}/{unique_name}",
                raw_text=text
            )

            # Sauvegarder les compétences extraites
            if cv_data.get("skills"):
                save_professor_skills(
                    professor_id=professor_id,
                    skills=cv_data["skills"]
                )

        except Exception as e:
            # La sauvegarde BDD échoue mais on retourne quand même les données
            print(f"Erreur sauvegarde BDD : {e}")

    return {
        "filename": file.filename,
        "extraction_id": extraction_id,
        "cv_data": cv_data,
        "saved": extraction_id is not None
    }