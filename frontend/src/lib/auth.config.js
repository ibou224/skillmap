/**
 * @module lib/auth.config
 * @description Configuration NextAuth « edge-safe » (sans dépendance Node/Prisma)
 * utilisée par le middleware. Définit la redirection par rôle et le contrôle
 * d'accès des sous-chemins du dashboard via le callback `authorized`.
 */

/** Page d'accueil par défaut selon le rôle de l'utilisateur. */
const ROLE_HOME = {
  ADMIN:      '/dashboard/admin',
  RH:         '/dashboard/rh',
  PROFESSEUR: '/dashboard/professeur',
}

/** Rôles autorisés pour chaque préfixe de chemin du dashboard. */
const ROLE_PATHS = {
  '/dashboard/admin':      ['ADMIN'],
  '/dashboard/rh':         ['RH', 'ADMIN'],
  '/dashboard/professeur': ['PROFESSEUR'],
}

/**
 * Configuration NextAuth partagée (pages, callbacks `session` et `authorized`).
 * Les providers sont injectés dans {@link module:lib/auth}.
 * @type {import('next-auth').NextAuthConfig}
 */
export const authConfig = {
  providers: [],
  pages: {
    signIn: '/login',
    error:  '/login',
  },
  callbacks: {
    async session({ session, token }) {
      if (token?.role)  session.user.role  = token.role
      if (token?.error) session.error      = token.error
      return session
    },

    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn  = !!auth?.user
      const isDashboard = nextUrl.pathname.startsWith('/dashboard')
      const isPublic    = ['/', '/login'].includes(nextUrl.pathname)

      // Refresh token expiré → forcer la reconnexion
      if (auth?.error === 'RefreshTokenError') return false

      // Pas connecté et tente d'accéder au dashboard → redirect /login
      if (isDashboard && !isLoggedIn) return false

      // Connecté et sur une page publique → redirect vers page de rôle
      if (isPublic && isLoggedIn) {
        const home = ROLE_HOME[auth.user.role] ?? '/dashboard'
        return Response.redirect(new URL(home, nextUrl))
      }

      // Connecté mais mauvais rôle pour ce sous-chemin → redirect vers son dashboard
      if (isDashboard && isLoggedIn) {
        const role = auth.user.role
        for (const [prefix, allowed] of Object.entries(ROLE_PATHS)) {
          if (nextUrl.pathname.startsWith(prefix) && !allowed.includes(role)) {
            const home = ROLE_HOME[role] ?? '/dashboard'
            return Response.redirect(new URL(home, nextUrl))
          }
        }
      }

      return true
    },
  },
}
