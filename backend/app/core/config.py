# Lecture automatique des variables d'environnement depuis le fichier .env
from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    # Variables Supabase (obligatoires, sans valeurs par défaut)
    supabase_url: str
    supabase_service_key: str

    # Variables LLM (avec valeurs par défaut si absentes du .env)
    llm_base_url: str
    llm_model: str = "gpt-oss-ctx24k:120b"
    llm_cookie: str
    llm_api_key: str
    llm_temperature: float = 0.1

    # Origines autorisées à appeler l'API FastAPI (CORS)
    allowed_origins: List[str] = ["http://localhost:3000"]

    class Config:
        env_file = ".env"  # Fichier source des variables

# Instance unique partagée dans tout le projet
settings = Settings()