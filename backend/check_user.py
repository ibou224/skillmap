import psycopg2

conn = psycopg2.connect('postgresql://postgres.luoyvjcsufvotdjrzgyg:SkillMap2026@aws-1-us-west-2.pooler.supabase.com:5432/postgres')
cur = conn.cursor()
cur.execute('''
    SELECT u.email, p.id as professor_id 
    FROM "User" u 
    LEFT JOIN "Professor" p ON p."userId" = u.id 
    WHERE u.email = %s
''', ('alice.martin@lacitec.on.ca',))
print(cur.fetchone())
conn.close()