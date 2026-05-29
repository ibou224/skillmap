import psycopg2
import bcrypt

DATABASE_URL = "postgresql://postgres.luoyvjcsufvotdjrzgyg:SkillMap2026@aws-1-us-west-2.pooler.supabase.com:5432/postgres"

DEMO_EMAILS = [
    'alice.martin@lacitec.on.ca',
    'benoit.tremblay@lacitec.on.ca',
    'claire.nguyen@lacitec.on.ca',
    'david.okonkwo@lacitec.on.ca',
    'sophie.leblanc@lacitec.on.ca',
    'prof@lacitec.on.ca',
]

# Générer un vrai hash pour Demo2026!
hash = bcrypt.hashpw('Demo2026!'.encode(), bcrypt.gensalt(10)).decode()
print(f"Hash généré : {hash}")

conn = psycopg2.connect(DATABASE_URL)
cur = conn.cursor()

for email in DEMO_EMAILS:
    cur.execute("""
        UPDATE "User" SET "passwordHash" = %s WHERE email = %s
    """, (hash, email))
    print(f"Mis à jour : {email}")

conn.commit()
conn.close()
print("✅ Mots de passe mis à jour")