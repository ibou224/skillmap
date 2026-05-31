# database.py
# Service de connexion et d'opérations sur la base de données PostgreSQL.
# Utilisé par FastAPI pour sauvegarder les données extraites des CV.

import psycopg2
import psycopg2.extras
from app.core.config import settings

#  Connexion à PostgreSQL 

def get_connection():
    """
    Retourne une connexion à la base de données PostgreSQL.
    """
    return psycopg2.connect(settings.database_url)

#  Sauvegarde extraction CV 

def save_cv_extraction(professor_id: str, file_name: str, file_path: str, raw_text: str) -> str:
    """
    Crée une entrée CvExtraction en base avec statut EXTRACTED.
    Retourne l'ID de l'extraction créée.
    """
    conn = get_connection()
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute("""
                INSERT INTO "CvExtraction" (id, "professorId", "fileName", "filePath", status, "extractedAt", "createdAt")
                VALUES (gen_random_uuid(), %s, %s, %s, 'EXTRACTED', NOW(), NOW())
                RETURNING id
            """, (professor_id, file_name, file_path))
            result = cur.fetchone()
            conn.commit()
            return str(result["id"])
    finally:
        conn.close()

#  Sauvegarde compétences professeur 

VALID_NIVEAUX = {"DEBUTANT", "INTERMEDIAIRE", "AVANCE"}

def save_professor_skills(professor_id: str, skills: list) -> None:
    """
    Insère ou met à jour les compétences d'un professeur.
    Crée la compétence dans le référentiel si elle n'existe pas.
    Accepte skills comme liste de str OU de dict {"nom": str, "niveau": str}.
    """
    if not skills:
        return

    conn = get_connection()
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            for skill_entry in skills:
                # Normaliser : dict {"nom", "niveau"} ou simple chaîne
                if isinstance(skill_entry, dict):
                    skill_name = (skill_entry.get("nom") or "").strip()
                    niveau = skill_entry.get("niveau", "INTERMEDIAIRE")
                    annees_exp = skill_entry.get("anneesExp") or 0
                else:
                    skill_name = str(skill_entry).strip()
                    niveau = "INTERMEDIAIRE"
                    annees_exp = 0

                if not skill_name:
                    continue

                # Valider le niveau (évite une contrainte enum PostgreSQL)
                if niveau not in VALID_NIVEAUX:
                    niveau = "INTERMEDIAIRE"

                # Créer la compétence si elle n'existe pas
                cur.execute("""
                    INSERT INTO "Skill" (id, nom, categorie, "createdAt")
                    VALUES (gen_random_uuid(), %s, 'Non classifiée', NOW())
                    ON CONFLICT (nom) DO NOTHING
                """, (skill_name,))

                # Récupérer l'ID de la compétence
                cur.execute('SELECT id FROM "Skill" WHERE nom = %s', (skill_name,))
                skill = cur.fetchone()
                if not skill:
                    continue

                # Lier la compétence au professeur (niveau + anneesExp depuis le LLM)
                cur.execute("""
                    INSERT INTO "ProfessorSkill" ("professorId", "skillId", niveau, "anneesExp", source, "createdAt")
                    VALUES (%s, %s, %s, %s, 'EXTRACTION_IA', NOW())
                    ON CONFLICT ("professorId", "skillId") DO UPDATE
                      SET niveau = EXCLUDED.niveau,
                          "anneesExp" = COALESCE(EXCLUDED."anneesExp", "ProfessorSkill"."anneesExp")
                """, (professor_id, str(skill["id"]), niveau, annees_exp))

            conn.commit()
    finally:
        conn.close()

#  Sauvegarde affectations 

def save_assignments(session_id: str, assignments: list) -> int:
    """
    Sauvegarde les propositions d'affectation en base avec statut PROPOSEE.
    Supprime d'abord les propositions existantes pour la session (idempotent).
    Retourne le nombre d'affectations insérées.
    """
    if not assignments:
        return 0

    conn = get_connection()
    try:
        with conn.cursor() as cur:
            # Supprimer les propositions existantes pour cette session
            cur.execute("""
                DELETE FROM "Assignment"
                WHERE "sessionId" = %s AND statut = 'PROPOSEE'
            """, (session_id,))

            # Insérer les nouvelles propositions
            for proposal in assignments:
                cur.execute("""
                    INSERT INTO "Assignment" (
                        id,
                        "sessionId",
                        "professorId",
                        "courseId",
                        score,
                        "scoreDetail",
                        statut,
                        "createdAt",
                        "updatedAt"
                    )
                    VALUES (
                        gen_random_uuid(),
                        %s, %s, %s, %s,
                        %s::jsonb,
                        'PROPOSEE',
                        NOW(), NOW()
                    )
                    ON CONFLICT ("sessionId", "professorId", "courseId") DO NOTHING
                """, (
                    session_id,
                    proposal["professor_id"],
                    proposal["course_id"],
                    proposal["score"],
                    psycopg2.extras.Json(proposal.get("score_detail", {})),
                ))

            conn.commit()
            return len(assignments)
    finally:
        conn.close()

#  Vérifier appartenance professeur → utilisateur

def professor_belongs_to_user(professor_id: str, user_id: str) -> bool:
    """
    Retourne True si le profil Professor identifié par professor_id
    est bien lié au compte utilisateur user_id.
    Utilisé pour empêcher qu'un utilisateur analyse le CV d'un autre.
    """
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT 1 FROM "Professor"
                WHERE id = %s AND "userId" = %s
                LIMIT 1
            """, (professor_id, user_id))
            return cur.fetchone() is not None
    finally:
        conn.close()

#  Récupérer professeur par userId

def get_professor_by_user_id(user_id: str) -> dict:
    """
    Retourne le profil professeur associé à un userId.
    """
    conn = get_connection()
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute("""
                SELECT p.* FROM "Professor" p
                WHERE p."userId" = %s
            """, (user_id,))
            result = cur.fetchone()
            return dict(result) if result else None
    finally:
        conn.close()