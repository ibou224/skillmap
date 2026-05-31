import psycopg2

DATABASE_URL = "postgresql://postgres.luoyvjcsufvotdjrzgyg:SkillMap2026@aws-1-us-west-2.pooler.supabase.com:5432/postgres"

DEMO_EMAILS = (
    'alice.martin@lacitec.on.ca',
    'benoit.tremblay@lacitec.on.ca',
    'claire.nguyen@lacitec.on.ca',
    'david.okonkwo@lacitec.on.ca',
    'sophie.leblanc@lacitec.on.ca',
    'admin@lacitec.on.ca',
    'rh@lacitec.on.ca',
    'prof@lacitec.on.ca',
)

conn = psycopg2.connect(DATABASE_URL)
cur = conn.cursor()

# Nettoyer cours et programmes
cur.execute('DELETE FROM "CourseSkill"')
cur.execute('DELETE FROM "Assignment"')
cur.execute('DELETE FROM "_CourseToProgram"')
cur.execute('DELETE FROM "Course"')
cur.execute('DELETE FROM "Program"')
cur.execute('DELETE FROM "Departement"')

# Nettoyer anciens professeurs
cur.execute("""
    DELETE FROM "ProfessorSkill" WHERE "professorId" IN (
        SELECT p.id FROM "Professor" p
        JOIN "User" u ON p."userId" = u.id
        WHERE u.email NOT IN %s
    )
""", (DEMO_EMAILS,))

cur.execute("""
    DELETE FROM "Formation" WHERE "professorId" IN (
        SELECT p.id FROM "Professor" p
        JOIN "User" u ON p."userId" = u.id
        WHERE u.email NOT IN %s
    )
""", (DEMO_EMAILS,))

cur.execute("""
    DELETE FROM "Experience" WHERE "professorId" IN (
        SELECT p.id FROM "Professor" p
        JOIN "User" u ON p."userId" = u.id
        WHERE u.email NOT IN %s
    )
""", (DEMO_EMAILS,))

cur.execute("""
    DELETE FROM "CvSnapshot" WHERE "professorId" IN (
        SELECT p.id FROM "Professor" p
        JOIN "User" u ON p."userId" = u.id
        WHERE u.email NOT IN %s
    )
""", (DEMO_EMAILS,))

cur.execute("""
    DELETE FROM "CvExtraction" WHERE "professorId" IN (
        SELECT p.id FROM "Professor" p
        JOIN "User" u ON p."userId" = u.id
        WHERE u.email NOT IN %s
    )
""", (DEMO_EMAILS,))

cur.execute("""
    DELETE FROM "Professor" WHERE "userId" IN (
        SELECT id FROM "User" WHERE email NOT IN %s
    )
""", (DEMO_EMAILS,))

cur.execute("""
    DELETE FROM "User" WHERE email NOT IN %s
""", (DEMO_EMAILS,))

conn.commit()
print("BDD nettoyée ✅")
conn.close()