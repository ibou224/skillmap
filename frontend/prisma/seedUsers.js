import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg }    from '@prisma/adapter-pg'
import bcrypt          from 'bcryptjs'
import 'dotenv/config'

const adapter = new PrismaPg(process.env.DATABASE_URL)
const prisma  = new PrismaClient({ adapter })


async function main() {
  const [hashAdmin, hashRh, hashProf] = await Promise.all([
    bcrypt.hash('Admin1234!', 10),
    bcrypt.hash('RhSkillMap1!', 10),
    bcrypt.hash('Prof1234!', 10),
  ])

  // Utilisateurs système
  const admin = await prisma.user.upsert({
    where:  { email: 'admin@lacitec.on.ca' },
    update: { nom: 'Admin', prenom: 'SkillMap' },
    create: { email: 'admin@lacitec.on.ca', nom: 'Admin', prenom: 'SkillMap', passwordHash: hashAdmin, role: 'ADMIN', isActive: true },
  })

  const rh = await prisma.user.upsert({
    where:  { email: 'rh@lacitec.on.ca' },
    update: { nom: 'RH', prenom: 'SkillMap' },
    create: { email: 'rh@lacitec.on.ca', nom: 'RH', prenom: 'SkillMap', passwordHash: hashRh, role: 'RH', isActive: true },
  })

  const profTest = await prisma.user.upsert({
    where:  { email: 'prof@lacitec.on.ca' },
    update: { nom: 'Professeur', prenom: 'Test' },
    create: { email: 'prof@lacitec.on.ca', nom: 'Professeur', prenom: 'Test', passwordHash: hashProf, role: 'PROFESSEUR', isActive: true },
  })

  // Profil professeur pour le compte de test
  await prisma.professor.upsert({
    where:  { userId: profTest.id },
    update: { ville: 'Ottawa', resume: 'Compte de test professeur.' },
    create: { userId: profTest.id, ville: 'Ottawa', resume: 'Compte de test professeur.' },
  })

  console.log('Utilisateur créé :', admin.email,   '| rôle :', admin.role)
  console.log('Utilisateur créé :', rh.email,      '| rôle :', rh.role)
  console.log('Utilisateur créé :', profTest.email, '| rôle :', profTest.role)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
