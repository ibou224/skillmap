import { PrismaClient } from '../generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'


// configuration du patron singleton pur la c0nnexion de prisma a la base de donnee

// On pointe vers la mémoire globale de l'application
const globalForPrisma = globalThis

// Si la connexion n'existe pas encore, on la crée
if (!globalForPrisma.prisma) {
  // On configure la connexion à la base de données PostgreSQL
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
  })

  globalForPrisma.prisma = new PrismaClient({
    adapter,
    // En développement, on affiche toutes les requêtes SQL dans la console
    // En production, on affiche seulement les erreurs
    log: process.env.NODE_ENV === 'development'
      ? ['query', 'error', 'warn']
      : ['error'],
  })
}

// On exporte toujours la même connexion (patron Singleton)
const prisma = globalForPrisma.prisma

export default prisma
