/**
 * @module lib/prisma
 * @description Instance unique (patron Singleton) du client Prisma connecté à
 * PostgreSQL. Réutilise la même connexion entre les hot-reloads Next.js via
 * `globalThis` pour éviter d'épuiser le pool de connexions en développement.
 */

import { PrismaClient } from '../generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'


// configuration du patron singleton pur la c0nnexion de prisma a la base de donnee

// On pointe vers la mémoire globale de l'application
const globalForPrisma = globalThis

// Si la connexion n'existe pas encore, on la crée
if (!globalForPrisma.prisma) {
  // On configure la connexion à la base de données PostgreSQL
  const adapter = new PrismaPg(process.env.DATABASE_URL)

  globalForPrisma.prisma = new PrismaClient({
    adapter,
    // En développement, on affiche toutes les requêtes SQL dans la console
    // En production, on affiche seulement les erreurs
    log: ['warn','error'],
  })
}

// On exporte toujours la même connexion (patron Singleton)
const prisma = globalForPrisma.prisma

export default prisma
