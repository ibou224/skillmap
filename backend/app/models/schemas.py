# schemas.py
# Définition des structures de données (modèles Pydantic) utilisées dans l'API.
# Ces modèles valident automatiquement les données qui entrent et sortent de l'application.

from pydantic import BaseModel
from typing import List, Optional

#  Modèles pour l'extraction CV 

class Education(BaseModel):
    diploma: str
    institution: str
    year: Optional[int] = None
    niveauDiplome: Optional[str] = None

class Experience(BaseModel):
    position: str
    organization: str
    yearsExp: Optional[float] = None
    description: Optional[str] = None

class CVData(BaseModel):
    # Données complètes extraites du CV par le LLM
    firstName: Optional[str] = None
    lastName: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    education: List[Education] = []
    experiences: List[Experience] = []
    skills: List[str] = []
    languages: List[str] = []
    totalYearsExperience: Optional[float] = None

#  Modèles pour l'affectation 

class AssignmentProposal(BaseModel):
    # Une proposition d'affectation pour un couple professeur/cours
    professor_id: str
    professor_name: str
    course_id: str
    course_name: str
    score: float
    score_detail: dict

class AssignmentResult(BaseModel):
    # Résultat complet d'un lancement d'affectation pour une session
    session_id: str
    total_proposals: int
    assignments: List[AssignmentProposal]