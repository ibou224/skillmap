# seed_demo.py
# Script d'insertion de données fictives réalistes pour la démo SkillMap.
# Insère : compétences, départements, programmes, cours, professeurs, session, pondérations.
# Idempotent : utilise ON CONFLICT DO NOTHING — peut être relancé sans créer de doublons.
#
# Usage :
#   python seed_demo.py
#   DATABASE_URL=postgresql://... python seed_demo.py

import os
import sys
import psycopg2
import psycopg2.extras

# ── Connexion ─────────────────────────────────────────────────────────────────

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://admin:SkillMap2026@localhost:5432/skillmap_bd"
)

def get_connection():
    return psycopg2.connect(DATABASE_URL)

# ── Données ───────────────────────────────────────────────────────────────────

# 1. Compétences du catalogue
SKILLS = [
    ("Python",              "Programmation"),
    ("Java",                "Programmation"),
    ("JavaScript",          "Programmation"),
    ("SQL",                 "Base de données"),
    ("Machine Learning",    "Intelligence artificielle"),
    ("Réseaux",             "Infrastructure"),
    ("Gestion de projet",   "Gestion"),
    ("Comptabilité",        "Gestion"),
    ("Analyse de données",  "Intelligence artificielle"),
    ("Docker",              "Infrastructure"),
    ("React",               "Programmation"),
    ("Sécurité informatique", "Infrastructure"),
]

# 2. Départements
DEPARTEMENTS = [
    ("TI",   "Technologies de l'information"),
    ("GEST", "Gestion des affaires"),
]

# 3. Programmes  (code, nom, nbEtapes, code_departement)
PROGRAMS = [
    ("IAI",  "Intelligence artificielle et informatique", 3, "TI"),
    ("PI",   "Programmation informatique",                3, "TI"),
    ("GEST", "Gestion",                                   2, "GEST"),
]

# 4. Cours  (code, nom, etape, [codes_programmes])
COURSES = [
    ("IAI-101", "Introduction à l'IA",              1, ["IAI"]),
    ("IAI-201", "Apprentissage automatique",         2, ["IAI"]),
    ("IAI-301", "Traitement des données avancé",     3, ["IAI"]),
    ("PI-101",  "Programmation orientée objet",      1, ["PI", "IAI"]),
    ("PI-201",  "Développement web",                 2, ["PI"]),
    ("PI-301",  "Architecture logicielle",           3, ["PI"]),
    ("GEST-101","Comptabilité générale",              1, ["GEST"]),
    ("GEST-201","Gestion de projet informatique",    2, ["GEST", "PI"]),
]

# Compétences requises par cours  (code_cours, nom_skill, niveauRequis, poidsCritique)
COURSE_SKILLS = [
    ("IAI-101", "Python",             "INTERMEDIAIRE", 3),
    ("IAI-101", "Analyse de données", "DEBUTANT",      2),
    ("IAI-201", "Machine Learning",   "INTERMEDIAIRE", 3),
    ("IAI-201", "Python",             "AVANCE",        2),
    ("IAI-201", "Analyse de données", "INTERMEDIAIRE", 2),
    ("IAI-301", "Machine Learning",   "AVANCE",        3),
    ("IAI-301", "Python",             "AVANCE",        2),
    ("IAI-301", "Analyse de données", "AVANCE",        3),
    ("PI-101",  "Java",               "INTERMEDIAIRE", 3),
    ("PI-101",  "Python",             "DEBUTANT",      1),
    ("PI-201",  "JavaScript",         "INTERMEDIAIRE", 3),
    ("PI-201",  "React",              "DEBUTANT",      2),
    ("PI-301",  "Docker",             "INTERMEDIAIRE", 2),
    ("PI-301",  "Sécurité informatique", "DEBUTANT",   2),
    ("GEST-101","Comptabilité",        "INTERMEDIAIRE", 3),
    ("GEST-201","Gestion de projet",   "INTERMEDIAIRE", 3),
    ("GEST-201","SQL",                 "DEBUTANT",      1),
]

# 5. Professeurs  (email, nom, prenom, role, passwordHash bcrypt de "Demo2026!")
# Hash bcrypt généré pour le mot de passe "Demo2026!" (coût 10)
DEMO_PASSWORD_HASH = "$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi"

PROFESSORS = [
    {
        "email":   "alice.martin@lacitec.on.ca",
        "nom":     "Martin",
        "prenom":  "Alice",
        "ville":   "Ottawa",
        "resume":  "Spécialiste en intelligence artificielle avec 12 ans d'expérience.",
        "langues": ["Français", "Anglais"],
        "formations": [
            ("Doctorat en informatique", "DOCTORATE", "Université d'Ottawa", 2012),
        ],
        "experiences": [
            ("Chercheuse IA",        "Recherche", "2012-01-01", None,         "CNRC Ottawa"),
            ("Professeure adjointe", "Éducation", "2018-09-01", "2022-06-30", "La Cité"),
        ],
        "skills": [
            ("Python",           "AVANCE",        10),
            ("Machine Learning", "AVANCE",        10),
            ("Analyse de données","AVANCE",        8),
            ("SQL",              "INTERMEDIAIRE",  5),
        ],
    },
    {
        "email":   "benoit.tremblay@lacitec.on.ca",
        "nom":     "Tremblay",
        "prenom":  "Benoît",
        "ville":   "Gatineau",
        "resume":  "Développeur full-stack et enseignant en programmation depuis 8 ans.",
        "langues": ["Français"],
        "formations": [
            ("Maîtrise en génie logiciel", "MASTERS", "Université du Québec", 2016),
        ],
        "experiences": [
            ("Développeur senior", "Développement", "2016-06-01", "2020-12-31", "Shopify"),
            ("Chargé de cours",    "Éducation",     "2021-01-01", None,         "La Cité"),
        ],
        "skills": [
            ("JavaScript",  "AVANCE",        7),
            ("React",       "AVANCE",        6),
            ("Python",      "INTERMEDIAIRE", 4),
            ("Docker",      "INTERMEDIAIRE", 3),
            ("SQL",         "INTERMEDIAIRE", 5),
        ],
    },
    {
        "email":   "claire.nguyen@lacitec.on.ca",
        "nom":     "Nguyen",
        "prenom":  "Claire",
        "ville":   "Ottawa",
        "resume":  "Experte en infrastructure et sécurité informatique.",
        "langues": ["Français", "Anglais", "Vietnamien"],
        "formations": [
            ("Baccalauréat en sécurité informatique", "BACHELORS", "Carleton University", 2014),
        ],
        "experiences": [
            ("Analyste sécurité",  "Sécurité",  "2014-09-01", "2019-08-31", "Gouvernement du Canada"),
            ("Professeure",        "Éducation", "2019-09-01", None,         "La Cité"),
        ],
        "skills": [
            ("Sécurité informatique", "AVANCE",        9),
            ("Réseaux",               "AVANCE",        8),
            ("Docker",                "INTERMEDIAIRE", 4),
            ("Linux",                 "INTERMEDIAIRE", 6),
        ],
    },
    {
        "email":   "david.okonkwo@lacitec.on.ca",
        "nom":     "Okonkwo",
        "prenom":  "David",
        "ville":   "Ottawa",
        "resume":  "Spécialiste Java et architecture logicielle, 6 ans d'enseignement.",
        "langues": ["Français", "Anglais"],
        "formations": [
            ("Maîtrise en informatique", "MASTERS", "Université d'Ottawa", 2015),
        ],
        "experiences": [
            ("Architecte logiciel", "Développement", "2015-07-01", "2020-06-30", "IBM Canada"),
            ("Professeur",          "Éducation",     "2020-09-01", None,         "La Cité"),
        ],
        "skills": [
            ("Java",              "AVANCE",        8),
            ("Python",            "INTERMEDIAIRE", 4),
            ("Docker",            "AVANCE",        5),
            ("SQL",               "AVANCE",        6),
            ("Gestion de projet", "INTERMEDIAIRE", 3),
        ],
    },
    {
        "email":   "sophie.leblanc@lacitec.on.ca",
        "nom":     "Leblanc",
        "prenom":  "Sophie",
        "ville":   "Orléans",
        "resume":  "Professeure en gestion et comptabilité, MBA et 10 ans d'expérience.",
        "langues": ["Français", "Anglais"],
        "formations": [
            ("MBA", "MASTERS", "Université d'Ottawa", 2013),
            ("DEC en comptabilité", "DEC", "La Cité", 2010),
        ],
        "experiences": [
            ("Contrôleure financière", "Finance",   "2013-01-01", "2018-12-31", "Deloitte Canada"),
            ("Professeure",            "Éducation", "2019-01-01", None,         "La Cité"),
        ],
        "skills": [
            ("Comptabilité",    "AVANCE",        10),
            ("Gestion de projet","AVANCE",        7),
            ("SQL",             "DEBUTANT",       2),
            ("Analyse de données","INTERMEDIAIRE", 4),
        ],
    },
]

# 6. Session et pondérations
SESSION = {
    "nom":      "Automne 2026",
    "annee":    2026,
    "periode":  "AUTOMNE",
    "statut":   "PLANIFIEE",
}

WEIGHTS = {
    "competencesPct": 40,
    "experiencePct":  25,
    "formationPct":   20,
    "historiquePct":  15,
}

# ── Fonctions d'insertion ─────────────────────────────────────────────────────

def seed_skills(cur):
    print("  → Compétences...")
    for nom, categorie in SKILLS:
        cur.execute("""
            INSERT INTO "Skill" (id, nom, categorie, "createdAt")
            VALUES (gen_random_uuid(), %s, %s, NOW())
            ON CONFLICT (nom) DO NOTHING
        """, (nom, categorie))


def seed_departements(cur):
    print("  → Départements...")
    for code, nom in DEPARTEMENTS:
        cur.execute("""
            INSERT INTO "Departement" (id, code, nom, "createdAt", "updatedAt")
            VALUES (gen_random_uuid(), %s, %s, NOW(), NOW())
            ON CONFLICT (code) DO NOTHING
        """, (code, nom))


def seed_programs(cur):
    print("  → Programmes...")
    for code, nom, nb_etapes, dept_code in PROGRAMS:
        cur.execute('SELECT id FROM "Departement" WHERE code = %s', (dept_code,))
        dept = cur.fetchone()
        dept_id = dept[0] if dept else None

        cur.execute("""
            INSERT INTO "Program" (id, code, nom, "nbEtapes", "departementId", "createdAt")
            VALUES (gen_random_uuid(), %s, %s, %s, %s, NOW())
            ON CONFLICT (code) DO NOTHING
        """, (code, nom, nb_etapes, dept_id))


def seed_courses(cur):
    print("  → Cours...")
    for code, nom, etape, prog_codes in COURSES:
        # Insérer le cours
        cur.execute("""
            INSERT INTO "Course" (id, code, nom, etape, "isArchived", "createdAt", "updatedAt")
            VALUES (gen_random_uuid(), %s, %s, %s, false, NOW(), NOW())
            ON CONFLICT (code) DO NOTHING
        """, (code, nom, etape))

        # Récupérer l'ID du cours
        cur.execute('SELECT id FROM "Course" WHERE code = %s', (code,))
        course = cur.fetchone()
        if not course:
            continue
        course_id = course[0]

        # Lier aux programmes
        for prog_code in prog_codes:
            cur.execute('SELECT id FROM "Program" WHERE code = %s', (prog_code,))
            prog = cur.fetchone()
            if prog:
                cur.execute("""
                    INSERT INTO "_CourseToProgram" ("A", "B")
                    VALUES (%s, %s)
                    ON CONFLICT DO NOTHING
                """, (course_id, prog[0]))

    # Insérer les compétences requises par cours
    print("  → Compétences requises par cours...")
    for course_code, skill_nom, niveau_requis, poids in COURSE_SKILLS:
        cur.execute('SELECT id FROM "Course" WHERE code = %s', (course_code,))
        course = cur.fetchone()
        cur.execute('SELECT id FROM "Skill" WHERE nom = %s', (skill_nom,))
        skill = cur.fetchone()

        if course and skill:
            cur.execute("""
                INSERT INTO "CourseSkill" ("courseId", "skillId", "niveauRequis", "poidsCritique")
                VALUES (%s, %s, %s, %s)
                ON CONFLICT ("courseId", "skillId") DO NOTHING
            """, (course[0], skill[0], niveau_requis, poids))


def seed_professors(cur):
    print("  → Professeurs...")
    for prof in PROFESSORS:
        # Insérer User
        cur.execute("""
            INSERT INTO "User" (id, email, nom, prenom, "passwordHash", role, "isActive",
                                "loginAttempts", "createdAt", "updatedAt")
            VALUES (gen_random_uuid(), %s, %s, %s, %s, 'PROFESSEUR', true, 0, NOW(), NOW())
            ON CONFLICT (email) DO NOTHING
        """, (prof["email"], prof["nom"], prof["prenom"], DEMO_PASSWORD_HASH))

        # Récupérer l'ID du User
        cur.execute('SELECT id FROM "User" WHERE email = %s', (prof["email"],))
        user = cur.fetchone()
        if not user:
            continue
        user_id = user[0]

        # Insérer Professor
        cur.execute("""
            INSERT INTO "Professor" (id, "userId", ville, resume, langues, "createdAt", "updatedAt")
            VALUES (gen_random_uuid(), %s, %s, %s, %s, NOW(), NOW())
            ON CONFLICT ("userId") DO NOTHING
        """, (user_id, prof["ville"], prof["resume"], prof["langues"]))

        # Récupérer l'ID du Professor
        cur.execute('SELECT id FROM "Professor" WHERE "userId" = %s', (user_id,))
        professor = cur.fetchone()
        if not professor:
            continue
        professor_id = professor[0]

        # Insérer formations
        for diplome, niveau, etablissement, annee in prof["formations"]:
            cur.execute("""
                INSERT INTO "Formation" (id, "professorId", diplome, "niveauDiplome",
                                        etablissement, "anneeObtention", "createdAt")
                VALUES (gen_random_uuid(), %s, %s, %s, %s, %s, NOW())
            """, (professor_id, diplome, niveau, etablissement, annee))

        # Insérer expériences
        for poste, domaine, date_debut, date_fin, entreprise in prof["experiences"]:
            cur.execute("""
                INSERT INTO "Experience" (id, "professorId", poste, domaine,
                                         "dateDebut", "dateFin", "Entreprise", "createdAt")
                VALUES (gen_random_uuid(), %s, %s, %s, %s, %s, %s, NOW())
            """, (professor_id, poste, domaine, date_debut, date_fin, entreprise))

        # Insérer compétences
        for skill_nom, niveau, annees_exp in prof["skills"]:
            cur.execute('SELECT id FROM "Skill" WHERE nom = %s', (skill_nom,))
            skill = cur.fetchone()
            if skill:
                cur.execute("""
                    INSERT INTO "ProfessorSkill" ("professorId", "skillId", niveau,
                                                  "anneesExp", source, "createdAt")
                    VALUES (%s, %s, %s, %s, 'SAISIE_MANUELLE', NOW())
                    ON CONFLICT ("professorId", "skillId") DO NOTHING
                """, (professor_id, skill[0], niveau, annees_exp))


def seed_session(cur):
    print("  → Session Automne 2026...")
    cur.execute("""
        INSERT INTO "Session" (id, nom, annee, periode, statut, "createdAt", "updatedAt")
        VALUES (gen_random_uuid(), %s, %s, %s, %s, NOW(), NOW())
        ON CONFLICT (nom) DO NOTHING
    """, (SESSION["nom"], SESSION["annee"], SESSION["periode"], SESSION["statut"]))

    # Récupérer l'ID de la session
    cur.execute('SELECT id FROM "Session" WHERE nom = %s', (SESSION["nom"],))
    session = cur.fetchone()
    if not session:
        return

    print("  → Pondérations...")
    cur.execute("""
        INSERT INTO "WeightsConfig" (id, "sessionId", "competencesPct", "experiencePct",
                                     "formationPct", "historiquePct")
        VALUES (gen_random_uuid(), %s, %s, %s, %s, %s)
        ON CONFLICT ("sessionId") DO NOTHING
    """, (
        session[0],
        WEIGHTS["competencesPct"],
        WEIGHTS["experiencePct"],
        WEIGHTS["formationPct"],
        WEIGHTS["historiquePct"],
    ))


# ── Point d'entrée ────────────────────────────────────────────────────────────

def main():
    print("🌱 Démarrage du seed de démonstration SkillMap...")
    print(f"   Base de données : {DATABASE_URL.split('@')[-1]}\n")

    conn = get_connection()
    try:
        with conn.cursor() as cur:
            seed_skills(cur)
            seed_departements(cur)
            seed_programs(cur)
            seed_courses(cur)
            seed_professors(cur)
            seed_session(cur)
        conn.commit()
        print("\n✅ Seed terminé avec succès.")
        print("   Comptes professeurs créés (mot de passe : Demo2026!) :")
        for p in PROFESSORS:
            print(f"   - {p['email']}")
    except Exception as e:
        conn.rollback()
        print(f"\n❌ Erreur lors du seed : {e}")
        sys.exit(1)
    finally:
        conn.close()


if __name__ == "__main__":
    main()
