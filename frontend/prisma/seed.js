import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg }    from '@prisma/adapter-pg'
import bcrypt          from 'bcryptjs'
import 'dotenv/config'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma  = new PrismaClient({ adapter })

async function main() {
  const hash = await bcrypt.hash('Admin1234!', 10)

  const admin = await prisma.user.upsert({
    where:  { email: 'admin@lacitec.on.ca' },
    update: {
      nom:    'Admin',
      prenom: 'SkillMap',
    },
    create: {
      email:        'admin@lacitec.on.ca',
      nom:          'Admin',
      prenom:       'SkillMap',
      passwordHash: hash,
      role:         'ADMIN',
      isActive:     true,
    },
  })

  console.log('Utilisateur créé :', admin.email, '| rôle :', admin.role)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())

  // kevin.tiam@lacitec.on.ca
  // KEvintiam7816&

  // rostand.tiam@lacitec.on.ca
  // ROstandtiam9839$