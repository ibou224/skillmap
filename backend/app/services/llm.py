# llm.py
# Service d'appel au LLM pour extraire les données structurées d'un CV.
# Utilise le SDK OpenAI redirigé vers l'API de la compétition (CoCalc).
# Bascule automatiquement sur un fallback regex si le LLM est indisponible.

import json
import re
import httpx
from openai import OpenAI
from app.core.config import settings

#  Prompt d'extraction 

# Demande au LLM de retourner uniquement un JSON structuré, sans texte autour
CV_EXTRACTION_PROMPT = """
You are a CV parsing expert. Extract structured information from the following CV text and return ONLY a valid JSON object, no explanation, no markdown.

The JSON must follow this exact schema:
{
  "firstName": "string",
  "lastName": "string",
  "email": "string or null",
  "phone": "string or null",
  "education": [
    {
      "diploma": "string",
      "institution": "string",
      "year": "number or null",
      "niveauDiplome": "one of: DOCTORATE, MASTERS, BACHELORS, DEC, OTHER"
    }
  ],
  "experiences": [
    {
      "position": "string",
      "organization": "string",
      "yearsExp": "number or null",
      "description": "string or null"
    }
  ],
  "skills": ["string"],
  "languages": ["string"],
  "totalYearsExperience": "number or null"
}

If a field is not found in the CV, use null or an empty array.

CV TEXT:
{cv_text}
"""

#  Client LLM 

def _get_llm_client() -> OpenAI:
    # Crée un client HTTP avec le cookie d'authentification CoCalc
    http_client = httpx.Client(
        cookies={"COCALC_COMPUTE_SERVER_AUTH_TOKEN": settings.llm_cookie}
    )
    # Redirige le SDK OpenAI vers l'API de la compétition
    return OpenAI(
        base_url=settings.llm_base_url,
        api_key=settings.llm_api_key,
        http_client=http_client
    )

#  Extraction principale 

async def extract_cv_data(cv_text: str) -> dict:
    # Appelle le LLM avec le texte du CV et retourne les données structurées
    try:
        client = _get_llm_client()
        prompt = CV_EXTRACTION_PROMPT.replace("{cv_text}", cv_text)

        response = client.chat.completions.create(
            model=settings.llm_model,
            messages=[
                {"role": "system", "content": "You are a CV parsing expert. Return only valid JSON."},
                {"role": "user", "content": prompt}
            ],
            temperature=settings.llm_temperature,
            timeout=30
        )

        raw = response.choices[0].message.content
        return json.loads(raw)

    except Exception as e:
        print(f"LLM échoué ({e}), utilisation du fallback regex")
        return _fallback_extraction(cv_text)

#  Fallback regex 

def _fallback_extraction(text: str) -> dict:
    # Extraction basique par expressions régulières si le LLM est indisponible
    email = re.findall(r"[\w.+-]+@[\w-]+\.[a-zA-Z]{2,}", text)
    phone = re.findall(r"\+?[\d\s\-().]{10,}", text)

    return {
        "firstName": None,
        "lastName": None,
        "email": email[0] if email else None,
        "phone": phone[0].strip() if phone else None,
        "education": [],
        "experiences": [],
        "skills": [],
        "languages": [],
        "totalYearsExperience": None,
        "extraction_method": "fallback_regex"
    }