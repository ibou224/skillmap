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
                INSERT INTO "CvExtraction" (id, "professorId", "fileName", "filePath", "rawText", status, "extractedAt", "createdAt")
                VALUES (gen_random_uuid(), %s, %s, %s, %s, 'EXTRACTED', NOW(), NOW())
                RETURNING id
            """, (professor_id, file_name, file_path, raw_text))
            result = cur.fetchone()
            conn.commit()
            return str(result["id"])
    finally:
        conn.close()

#  Sauvegarde compétences professeur 

def save_professor_skills(professor_id: str, skills: list) -> None:
    """
    Insère ou met à jour les compétences d'un professeur.
    Crée la compétence dans le référentiel si elle n'existe pas.
    """
    if not skills:
        return

    conn = get_connection()
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            for skill_name in skills:
                # Créer la compétence si elle n'existe pas
                cur.execute("""
                    INSERT INTO "Skill" (id, nom, categorie, "createdAt")
                    VALUES (gen_random_uuid(), %s, 'Non classifiée', NOW())
                    ON CONFLICT (nom) DO NOTHING
                    RETURNING id
                """, (skill_name,))

                # Récupérer l'ID de la compétence
                cur.execute('SELECT id FROM "Skill" WHERE nom = %s', (skill_name,))
                skill = cur.fetchone()
                if not skill:
                    continue

                # Lier la compétence au professeur
                cur.execute("""
                    INSERT INTO "ProfessorSkill" ("professorId", "skillId", niveau, "anneesExp", source, "createdAt")
                    VALUES (%s, %s, 'INTERMEDIAIRE', 0, 'EXTRACTION_IA', NOW())
                    ON CONFLICT ("professorId", "skillId") DO NOTHING
                """, (professor_id, str(skill["id"])))

            conn.commit()
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