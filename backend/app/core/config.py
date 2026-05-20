# config.py
# Configuration centrale de l'application FastAPI.
# Lit les variables d'environnement depuis le fichier .env via pydantic-settings.

from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):

    # Base de données PostgreSQL (Docker) 
    database_url: str

    # API LLM (CoCalc) 
    llm_base_url: str
    llm_model: str = "gpt-oss-ctx24k:120b"
    llm_cookie: str
    llm_api_key: str
    llm_temperature: float = 0.1

    # Sécurité 
    # Clé partagée entre Next.js et FastAPI pour sécuriser les appels internes
    internal_api_key: str

    # CORS 
    allowed_origins: List[str] = ["http://localhost:3000"]

    class Config:
        env_file = ".env"

# Instance unique partagée dans tout le projet
settings = Settings()