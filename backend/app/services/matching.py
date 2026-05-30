# matching.py
# Algorithme d'affectation pondérée des professeurs aux cours.
# Calcule un score de compatibilité pour chaque couple (professeur, cours)
# selon les compétences, l'expérience et la formation.

from typing import List, Dict

#  Niveaux de compétence (correspondance numérique)

NIVEAU_SCORE = {
    "DEBUTANT": 1,
    "INTERMEDIAIRE": 2,
    "AVANCE": 3
}

#  Niveaux de diplôme (bonus formation)

DIPLOME_SCORE = {
    "DOCTORATE": 1.0,   # Doctorat  → plein score (dépasse le requis)
    "MASTERS":   1.0,   # Maîtrise  → plein score (niveau cible)
    "BACHELORS": 0.6,   # Baccalauréat → 60%
    "DEC":       0.3,   # DEC        → 30%
    "OTHER":     0.1,   # Autre      → 10%
}

#  Fonction principale

async def run_matching(
    session_id: str,
    professors: List[dict],
    courses: List[dict],
    weights: Dict[str, float]
) -> List[dict]:
    """
    Lance l'algorithme d'affectation pour une session donnée.
    Retourne les propositions triées par score décroissant.
    """
    proposals = []

    for course in courses:
        course_proposals = []

        for professor in professors:
            # Calcul des scores individuels
            score_skills = _score_competences(
                professor.get("skills", []),
                course.get("required_skills", [])
            )
            score_exp = _score_experience(
                professor.get("yearsExperience", 0)
            )
            score_edu = _score_education(
                professor.get("education", [])
            )
            score_hist = _score_history(
                professor.get("history", []),
                course.get("id", "")
            )

            # Score final pondéré
            score = (
                weights.get("skills_weight", 0.40) * score_skills +
                weights.get("experience_weight", 0.25) * score_exp +
                weights.get("education_weight", 0.20) * score_edu +
                weights.get("history_weight", 0.15) * score_hist
            )

            course_proposals.append({
                "professor_id": professor["id"],
                "professor_name": f"{professor.get('firstName', '')} {professor.get('lastName', '')}",
                "course_id": course["id"],
                "course_name": course["nom"],
                "score": round(score * 100, 2),
                "score_detail": {
                    "skills": round(score_skills * 100, 2),
                    "experience": round(score_exp * 100, 2),
                    "education": round(score_edu * 100, 2),
                    "history": round(score_hist * 100, 2),
                }
            })

        # Trier par score décroissant pour ce cours
        course_proposals.sort(key=lambda x: x["score"], reverse=True)
        proposals.extend(course_proposals)

    return proposals

#  Score compétences

def _score_competences(
    professor_skills: List[dict],
    course_skills: List[dict]
) -> float:
    """
    niveauProf >= niveauRequis → 100%
    niveauProf < niveauRequis → 50%
    Compétence absente → 0%
    Pondéré par poidsCritique de chaque compétence.
    """
    if not course_skills:
        return 1.0  # Pas d'exigences → tout le monde est qualifié → score neutre

    total_weight = sum(s.get("poidsCritique", 1) for s in course_skills)
    if total_weight == 0:
        return 1.0  # Poids tous à 0 → aucune exigence effective → score neutre

    score = 0.0
    prof_skill_map = {s["skillId"]: s for s in professor_skills}

    for req_skill in course_skills:
        skill_id = req_skill["skillId"]
        poids = req_skill.get("poidsCritique", 1)
        niveau_requis = NIVEAU_SCORE.get(req_skill.get("niveauRequis", "DEBUTANT"), 1)

        if skill_id in prof_skill_map:
            niveau_prof = NIVEAU_SCORE.get(
                prof_skill_map[skill_id].get("niveau", "DEBUTANT"), 1
            )
            if niveau_prof >= niveau_requis:
                score += poids * 1.0  # 100%
            else:
                score += poids * 0.5  # 50%
        # Absent → 0%

    return round(score / total_weight, 4)

#  Score expérience

def _score_experience(annees_experience: float) -> float:
    """
    Normalise les années d'expérience entre 0 et 1.
    10 ans = score maximum de 1.0.
    """
    return round(min(annees_experience / 10, 1.0), 4)

#  Score formation

def _score_education(education: List[dict]) -> float:
    """
    Calcule le score basé sur le niveau de diplôme le plus élevé.
    """
    if not education:
        return 0.0

    scores = [
        DIPLOME_SCORE.get(e.get("niveauDiplome", "OTHER"), 0.2)
        for e in education
    ]
    return max(scores)

#  Score historique

def _score_history(history: List[str], course_id: str) -> float:
    """
    Retourne 1.0 si le professeur a déjà enseigné ce cours, 0.0 sinon.
    """
    return 1.0 if course_id in history else 0.0
