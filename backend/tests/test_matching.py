"""
Tests unitaires pour app/services/matching.py.

Exécution :
    pip install pytest
    pytest backend/tests/test_matching.py -v
"""

import asyncio
import pytest

from app.services.matching import (
    _score_competences,
    _score_experience,
    _score_education,
    _score_history,
    run_matching,
    NIVEAU_SCORE,
    DIPLOME_SCORE,
)


# ─────────────────────────────────────────────────────────────
# _score_competences
# ─────────────────────────────────────────────────────────────

class TestScoreCompetences:
    def test_no_course_skills_returns_neutral_score(self):
        """Cours sans exigences → score neutre 1.0 (tout le monde qualifié)."""
        assert _score_competences([], []) == 1.0

    def test_course_skills_all_zero_weight_returns_neutral(self):
        course_skills = [{"skillId": "s1", "niveauRequis": "AVANCE", "poidsCritique": 0}]
        assert _score_competences([], course_skills) == 1.0

    def test_prof_has_skill_at_required_level_returns_full(self):
        prof_skills   = [{"skillId": "s1", "niveau": "INTERMEDIAIRE"}]
        course_skills = [{"skillId": "s1", "niveauRequis": "INTERMEDIAIRE", "poidsCritique": 1}]
        assert _score_competences(prof_skills, course_skills) == 1.0

    def test_prof_has_skill_above_required_level_returns_full(self):
        prof_skills   = [{"skillId": "s1", "niveau": "AVANCE"}]
        course_skills = [{"skillId": "s1", "niveauRequis": "DEBUTANT", "poidsCritique": 1}]
        assert _score_competences(prof_skills, course_skills) == 1.0

    def test_prof_has_skill_below_required_level_returns_half(self):
        prof_skills   = [{"skillId": "s1", "niveau": "DEBUTANT"}]
        course_skills = [{"skillId": "s1", "niveauRequis": "AVANCE", "poidsCritique": 1}]
        assert _score_competences(prof_skills, course_skills) == 0.5

    def test_prof_missing_skill_contributes_zero(self):
        prof_skills   = []
        course_skills = [{"skillId": "s1", "niveauRequis": "DEBUTANT", "poidsCritique": 1}]
        assert _score_competences(prof_skills, course_skills) == 0.0

    def test_mixed_skills_weighted_average(self):
        """2 compétences égales en poids : 1 acquise, 1 manquante → 0.5."""
        prof_skills = [{"skillId": "s1", "niveau": "AVANCE"}]
        course_skills = [
            {"skillId": "s1", "niveauRequis": "DEBUTANT", "poidsCritique": 1},  # acquise → 1.0
            {"skillId": "s2", "niveauRequis": "DEBUTANT", "poidsCritique": 1},  # absente → 0.0
        ]
        result = _score_competences(prof_skills, course_skills)
        assert result == pytest.approx(0.5)

    def test_poids_critique_weights_more_critical_skills(self):
        """Compétence critique (poids=3) > compétence normale (poids=1)."""
        prof_skills = [{"skillId": "s1", "niveau": "AVANCE"}]
        course_skills = [
            {"skillId": "s1", "niveauRequis": "DEBUTANT", "poidsCritique": 3},  # acquise, critique
            {"skillId": "s2", "niveauRequis": "DEBUTANT", "poidsCritique": 1},  # absente
        ]
        # score = (3 * 1.0 + 1 * 0.0) / 4 = 0.75
        assert _score_competences(prof_skills, course_skills) == pytest.approx(0.75)


# ─────────────────────────────────────────────────────────────
# _score_experience
# ─────────────────────────────────────────────────────────────

class TestScoreExperience:
    def test_zero_years_returns_zero(self):
        assert _score_experience(0) == 0.0

    def test_five_years_returns_half(self):
        assert _score_experience(5) == pytest.approx(0.5)

    def test_ten_years_returns_one(self):
        assert _score_experience(10) == 1.0

    def test_more_than_ten_years_capped_at_one(self):
        assert _score_experience(15) == 1.0
        assert _score_experience(100) == 1.0

    def test_fractional_years(self):
        assert _score_experience(3.5) == pytest.approx(0.35)

    def test_nine_years_below_max(self):
        assert _score_experience(9) == pytest.approx(0.9)


# ─────────────────────────────────────────────────────────────
# _score_education
# ─────────────────────────────────────────────────────────────

class TestScoreEducation:
    def test_no_education_returns_zero(self):
        assert _score_education([]) == 0.0

    def test_doctorate_returns_max(self):
        assert _score_education([{"niveauDiplome": "DOCTORATE"}]) == 1.0

    def test_masters_returns_full(self):
        assert _score_education([{"niveauDiplome": "MASTERS"}]) == 1.0

    def test_bachelors_returns_06(self):
        assert _score_education([{"niveauDiplome": "BACHELORS"}]) == 0.6

    def test_dec_returns_03(self):
        assert _score_education([{"niveauDiplome": "DEC"}]) == 0.3

    def test_other_returns_01(self):
        assert _score_education([{"niveauDiplome": "OTHER"}]) == 0.1

    def test_unknown_level_defaults_to_01(self):
        assert _score_education([{"niveauDiplome": "INCONNU"}]) == 0.1

    def test_multiple_diplomas_returns_best(self):
        formations = [
            {"niveauDiplome": "DEC"},
            {"niveauDiplome": "MASTERS"},
            {"niveauDiplome": "BACHELORS"},
        ]
        assert _score_education(formations) == 1.0

    def test_missing_niveauDiplome_key_defaults_to_other(self):
        assert _score_education([{}]) == 0.1


# ─────────────────────────────────────────────────────────────
# _score_history
# ─────────────────────────────────────────────────────────────

class TestScoreHistory:
    def test_course_in_history_returns_one(self):
        assert _score_history(["c-1", "c-2"], "c-1") == 1.0

    def test_course_not_in_history_returns_zero(self):
        assert _score_history(["c-1", "c-2"], "c-3") == 0.0

    def test_empty_history_returns_zero(self):
        assert _score_history([], "c-1") == 0.0

    def test_course_id_is_case_sensitive(self):
        assert _score_history(["C-1"], "c-1") == 0.0


# ─────────────────────────────────────────────────────────────
# run_matching (intégration)
# ─────────────────────────────────────────────────────────────

DEFAULT_WEIGHTS = {
    "skills_weight":    0.40,
    "experience_weight":0.25,
    "education_weight": 0.20,
    "history_weight":   0.15,
}

def make_professor(pid="p1", skills=None, years_exp=5, education=None, history=None):
    # Utilise `is not None` pour que `skills=[]` reste une liste vide
    # (une liste vide est falsy, `[] or [...]` retournerait le défaut)
    return {
        "id":              pid,
        "firstName":       "Alice",
        "lastName":        "Tremblay",
        "skills":          skills if skills is not None else [{"skillId": "sk-1", "niveau": "AVANCE"}],
        "yearsExperience": years_exp,
        "education":       education if education is not None else [{"niveauDiplome": "MASTERS"}],
        "history":         history if history is not None else [],
    }

def make_course(cid="c-1", required_skills=None):
    return {
        "id":              cid,
        "nom":             "Algorithmique",
        "required_skills": required_skills or [
            {"skillId": "sk-1", "niveauRequis": "INTERMEDIAIRE", "poidsCritique": 1}
        ],
    }


class TestRunMatching:
    def test_returns_one_proposal_per_prof_per_course(self):
        profs   = [make_professor("p1"), make_professor("p2")]
        courses = [make_course("c-1")]
        result  = asyncio.run(run_matching("sess-1", profs, courses, DEFAULT_WEIGHTS))
        assert len(result) == 2  # 2 profs × 1 cours

    def test_multiple_courses_generate_all_combinations(self):
        profs   = [make_professor("p1"), make_professor("p2")]
        courses = [make_course("c-1"), make_course("c-2")]
        result  = asyncio.run(run_matching("sess-1", profs, courses, DEFAULT_WEIGHTS))
        assert len(result) == 4  # 2 profs × 2 cours

    def test_scores_are_in_0_to_100_range(self):
        profs   = [make_professor()]
        courses = [make_course()]
        result  = asyncio.run(run_matching("sess-1", profs, courses, DEFAULT_WEIGHTS))
        for p in result:
            assert 0 <= p["score"] <= 100

    def test_result_contains_required_fields(self):
        profs   = [make_professor()]
        courses = [make_course()]
        result  = asyncio.run(run_matching("sess-1", profs, courses, DEFAULT_WEIGHTS))
        r = result[0]
        assert "professor_id"   in r
        assert "course_id"      in r
        assert "score"          in r
        assert "score_detail"   in r
        assert "skills"         in r["score_detail"]
        assert "experience"     in r["score_detail"]
        assert "education"      in r["score_detail"]
        assert "history"        in r["score_detail"]

    def test_proposals_sorted_by_score_descending_per_course(self):
        # p1 qualifié, p2 sans compétence → p1 doit être en tête
        p1 = make_professor("p1", skills=[{"skillId": "sk-1", "niveau": "AVANCE"}], years_exp=10)
        p2 = make_professor("p2", skills=[], years_exp=0, education=[{"niveauDiplome": "OTHER"}])
        courses = [make_course("c-1")]
        result  = asyncio.run(run_matching("sess-1", [p1, p2], courses, DEFAULT_WEIGHTS))

        c1_proposals = [r for r in result if r["course_id"] == "c-1"]
        scores = [p["score"] for p in c1_proposals]
        assert scores == sorted(scores, reverse=True)

    def test_history_bonus_increases_score(self):
        p_with_history    = make_professor("p1", history=["c-1"])
        p_without_history = make_professor("p2", history=[])
        courses = [make_course("c-1")]

        result = asyncio.run(run_matching("sess-1", [p_with_history, p_without_history], courses, DEFAULT_WEIGHTS))

        score_with    = next(r["score"] for r in result if r["professor_id"] == "p1")
        score_without = next(r["score"] for r in result if r["professor_id"] == "p2")
        assert score_with > score_without

    def test_custom_weights_respected(self):
        """Poids compétences = 1.0 → les autres critères n'ont aucun effet."""
        p_skilled = make_professor("p1", skills=[{"skillId": "sk-1", "niveau": "AVANCE"}], years_exp=0)
        p_unskill = make_professor("p2", skills=[], years_exp=10)
        courses   = [make_course("c-1")]
        weights   = {"skills_weight": 1.0, "experience_weight": 0.0, "education_weight": 0.0, "history_weight": 0.0}

        result = asyncio.run(run_matching("sess-1", [p_skilled, p_unskill], courses, weights))
        score_skilled = next(r["score"] for r in result if r["professor_id"] == "p1")
        score_unskill = next(r["score"] for r in result if r["professor_id"] == "p2")
        assert score_skilled > score_unskill

    def test_empty_professors_returns_empty(self):
        result = asyncio.run(run_matching("sess-1", [], [make_course()], DEFAULT_WEIGHTS))
        assert result == []

    def test_empty_courses_returns_empty(self):
        result = asyncio.run(run_matching("sess-1", [make_professor()], [], DEFAULT_WEIGHTS))
        assert result == []
