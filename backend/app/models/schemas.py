# schemas.py
# Définition des structures de données (modèles Pydantic) utilisées dans l'API.
# Ces modèles valident automatiquement les données qui entrent et sortent de l'application.

from pydantic import BaseModel
from typing import List, Optional

# Modèles pour l'extraction CV 
class Formation(BaseModel):
    diplome: str
    etablissement: str
    annee: Optional[int] = None

class Experience(BaseModel):
    poste: str
    organisation: str
    duree_annees: Optional[float] = None
    description: Optional[str] = None

class CVData(BaseModel):
    # Données complètes extraites du CV par le LLM
    nom: Optional[str] = None
    courriel: Optional[str] = None
    telephone: Optional[str] = None
    formation: List[Formation] = []
    experiences: List[Experience] = []
    competences: List[str] = []
    langues: List[str] = []
    annees_experience_totales: Optional[int] = None

#  Modèles pour l'affectation 

class AssignmentProposal(BaseModel):
    # Une proposition d'affectation pour un couple professeur/cours
    professor_id: str
    professor_nom: str
    course_id: str
    course_nom: str
    score: float
    score_competences: float
    score_experience: float
    score_historique: float

class AssignmentResult(BaseModel):
    # Résultat complet d'un lancement d'affectation pour une session
    session_id: str
    assignments: List[AssignmentProposal]