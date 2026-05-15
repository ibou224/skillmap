# cv.py
# Endpoint FastAPI pour l'upload et l'analyse automatique des CV.
# Reçoit un fichier PDF ou Word, extrait le texte et appelle le LLM
# pour retourner les données structurées.

from fastapi import APIRouter, UploadFile, File, HTTPException, Header
from app.services.parser import extract_text
from app.services.llm import extract_cv_data
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
    x_internal_api_key: str = Header(...)
):
    """
    Reçoit un CV (PDF ou Word), extrait le texte et retourne
    les données structurées via le LLM.
    """
    # Vérification de la clé API interne
    if x_internal_api_key != settings.internal_api_key:
        raise HTTPException(status_code=401, detail="Clé API invalide")

    # Vérification du format du fichier
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=400,
            detail="Format non supporté. PDF ou Word (.docx) uniquement."
        )

    # Lecture du contenu du fichier
    content = await file.read()

    # Extraction du texte brut
    text = extract_text(content, file.content_type)
    if not text:
        raise HTTPException(
            status_code=422,
            detail="Impossible d'extraire le texte du fichier."
        )

    # Extraction des données structurées via le LLM
    cv_data = await extract_cv_data(text)

    return {
        "filename": file.filename,
        "cv_data": cv_data
    }