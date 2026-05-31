/**
 * @module proxy
 * @description Middleware d'authentification de l'application. Initialise NextAuth
 * avec la configuration edge-safe ({@link module:lib/auth.config}) et protège
 * toutes les routes sauf les ressources statiques et l'API.
 */

import NextAuth from 'next-auth'
import { authConfig } from './lib/auth.config'

const { auth } = NextAuth(authConfig)

export default auth

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|images).*)'],
}