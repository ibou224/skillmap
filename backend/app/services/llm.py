# llm.py
# Service d'appel au LLM pour extraire les données structurées d'un CV.
# Utilise le SDK OpenAI redirigé vers l'API de la compétition (CoCalc).
# Bascule automatiquement sur un fallback regex si le LLM est indisponible.

import json
import re
import httpx
from openai import OpenAI
from app.core.config import settings
import asyncio

#  Prompt d'extraction 

# Demande au LLM de retourner uniquement un JSON structuré, sans texte autour
CV_EXTRACTION_PROMPT = """
You are an expert CV parser for an academic HR system. Extract structured information from the CV text below and return ONLY a valid JSON object — no explanation, no markdown, no extra text.

═══ SCHEMA ═══
{
  "firstName": "string",
  "lastName": "string",
  "email": "string or null",
  "phone": "string or null",
  "city": "string or null (city and province/country if mentioned)",
  "linkedin": "string or null (full LinkedIn URL or username, e.g. linkedin.com/in/alice-tremblay)",
  "portfolio": "string or null (personal website, GitHub Pages, portfolio URL — NOT LinkedIn)",
  "github": "string or null (GitHub profile URL or username)",
  "summary": "string or null (professional summary or objective — 2-5 sentences max)",

  "education": [
    {
      "diploma": "string",
      "institution": "string",
      "year": "number or null",
      "niveauDiplome": "one of: DOCTORATE, MASTERS, BACHELORS, DEC, OTHER"
    }
  ],

  "certifications": [
    {
      "title": "string",
      "year": "number or null"
    }
  ],

  "experiences": [
    {
      "position": "string",
      "organization": "string",
      "startDate": "string in YYYY-MM format, use YYYY-01 if only year is known, or null",
      "endDate": "string in YYYY-MM format or null if still ongoing (Présent / Present / Actuel)",
      "yearsExp": "number or null",
      "description": "string or null"
    }
  ],

  "skills": [
    {
      "nom": "string (canonical technology/framework name, e.g. React not React.js)",
      "niveau": "one of: DEBUTANT, INTERMEDIAIRE, AVANCE",
      "niveauSource": "one of: EXPLICIT, INFERRED",
      "anneesExp": "number or null"
    }
  ],

  "languages": ["string"],
  "totalYearsExperience": "number or null"
}

═══ SKILL EXTRACTION RULES ═══
1. NIVEAU — use EXPLICIT when the CV states the level directly (e.g. "React (Avancé)", "Advanced Python", "notions de Java"):
   - Words like Avancé / Advanced / Expert / Senior / Maîtrise → AVANCE
   - Words like Intermédiaire / Intermediate / Confirmé / Bon niveau → INTERMEDIAIRE
   - Words like Notions / Débutant / Beginner / Familier / Basic / Découverte → DEBUTANT
   Use INFERRED when the level is not stated — infer from context (years of use, role seniority, emphasis in CV).

2. SCOPE — only extract genuine technical skills: programming languages, frameworks, libraries, databases, cloud platforms, DevOps tools, methodologies (Scrum, Agile).
   DO NOT include: general office tools (Word, Excel, PowerPoint), soft skills (leadership, communication), or vague concepts (REST API, "Internet").

3. DEDUPLICATION — merge near-duplicates into one canonical name:
   - React / React.js / ReactJS → "React"
   - Node / Node.js / NodeJS → "Node.js"
   - Postgres / PostgreSQL → "PostgreSQL"
   - JS / JavaScript → "JavaScript"

4. anneesExp — estimate years of experience from dates in the CV if possible, otherwise leave null.

═══ CV TEXT ═══
{cv_text}
"""

#  Client LLM (singleton — créé une seule fois au premier appel)

_llm_client: OpenAI | None = None

def _get_llm_client() -> OpenAI:
    global _llm_client
    if _llm_client is None:
        http_client = httpx.Client(
            cookies={"COCALC_COMPUTE_SERVER_AUTH_TOKEN": settings.llm_cookie},
            timeout=60.0,
        )
        _llm_client = OpenAI(
            base_url=settings.llm_base_url,
            api_key=settings.llm_api_key,
            http_client=http_client,
        )
    return _llm_client

#  Extraction principale 

async def extract_cv_data(cv_text: str) -> dict:
    # Appelle le LLM dans un thread séparé pour ne pas bloquer FastAPI
    try:
        loop = asyncio.get_event_loop()
        result = await loop.run_in_executor(None, _call_llm, cv_text)
        return result
    except Exception as e:
        print(f"LLM échoué ({e}), utilisation du fallback regex")
        return _fallback_extraction(cv_text)

def _call_llm(cv_text: str) -> dict:
    # Appel synchrone au LLM — exécuté dans un thread séparé
    client = _get_llm_client()
    prompt = CV_EXTRACTION_PROMPT.replace("{cv_text}", cv_text)

    response = client.chat.completions.create(
        model=settings.llm_model,
        messages=[
            {"role": "system", "content": "You are a CV parsing expert. Return only valid JSON."},
            {"role": "user", "content": prompt}
        ],
        temperature=settings.llm_temperature,
        timeout=60
    )

    raw = response.choices[0].message.content
    # Nettoyer les balises markdown si présentes
    raw = raw.strip()
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
    raw = raw.strip()

    return json.loads(raw)

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
        "city": None,
        "linkedin": None,
        "portfolio": None,
        "github": None,
        "education": [],
        "certifications": [],
        "experiences": [],
        "skills": [],
        "languages": [],
        "totalYearsExperience": None,
        "extraction_method": "fallback_regex"
    }