/**
 * Handlers NextAuth.js pour les routes d'authentification.
 *
 * Délègue la gestion des requêtes GET et POST à NextAuth via la configuration
 * définie dans `@/lib/auth`. Gère automatiquement la connexion, la déconnexion
 * et les callbacks OAuth.
 *
 * @route GET  /api/auth/[...nextauth]
 * @route POST /api/auth/[...nextauth]
 */
import { handlers } from '@/lib/auth'

export const { GET, POST } = handlers
