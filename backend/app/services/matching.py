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
    "DOCTORAT": 1.0,
    "MAITRISE": 0.8,
    "BACCALAUREAT": 0.6,
    "DEC_TECHNIQUE": 0.4,
    "AUTRE": 0.2
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
            score_comp = _score_competences(
                professor.get("skills", []),
                course.get("required_skills", [])
            )
            score_exp = _score_experience(
                professor.get("annees_experience", 0)
            )
            score_form = _score_formation(
                professor.get("formations", [])
            )

            # Score final pondéré
            score = (
                weights.get("competences_pct", 0.6) * score_comp +
                weights.get("experience_pct", 0.4) * score_exp +
                weights.get("formation_pct", 0.0) * score_form
            )

            course_proposals.append({
                "professor_id": professor["id"],
                "professor_nom": f"{professor['prenom']} {professor['nom']}",
                "course_id": course["id"],
                "course_nom": course["nom"],
                "score": round(score, 4),
                "score_competences": round(score_comp, 4),
                "score_experience": round(score_exp, 4),
                "score_formation": round(score_form, 4),
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
    Calcule le score de compétences d'un professeur pour un cours.
    Tient compte du niveau de maîtrise et du poids critique de chaque compétence.
    """
    if not course_skills:
        return 0.0

    total_weight = sum(s.get("poids_critique", 1) for s in course_skills)
    if total_weight == 0:
        return 0.0

    score = 0.0
    prof_skill_map = {s["skill_id"]: s for s in professor_skills}

    for req_skill in course_skills:
        skill_id = req_skill["skill_id"]
        poids = req_skill.get("poids_critique", 1)
        niveau_requis = NIVEAU_SCORE.get(req_skill.get("niveau_requis", "DEBUTANT"), 1)

        if skill_id in prof_skill_map:
            niveau_prof = NIVEAU_SCORE.get(
                prof_skill_map[skill_id].get("niveau", "DEBUTANT"), 1
            )
            # Ratio niveau professeur / niveau requis (plafonné à 1)
            ratio = min(niveau_prof / niveau_requis, 1.0)
            score += poids * ratio

    return round(score / total_weight, 4)

#  Score expérience 

def _score_experience(annees_experience: int, max_experience: int = 30) -> float:
    """
    Normalise les années d'expérience entre 0 et 1.
    30 ans d'expérience = score maximum de 1.0.
    """
    if max_experience == 0:
        return 0.0
    return round(min(annees_experience / max_experience, 1.0), 4)

#  Score formation 

def _score_formation(formations: List[dict]) -> float:
    """
    Calcule le score de formation basé sur le niveau de diplôme le plus élevé.
    """
    if not formations:
        return 0.0

    scores = [
        DIPLOME_SCORE.get(f.get("niveau_diplome", "AUTRE"), 0.2)
        for f in formations
    ]
    return max(scores)