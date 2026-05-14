const ROLE_HOME = {
  ADMIN:      '/dashboard/admin',
  RH:         '/dashboard/rh',
  PROFESSEUR: '/dashboard/professeur',
}

export const authConfig = {
  providers: [],
  pages: {
    signIn: '/login',
    error:  '/login',
  },
  callbacks: {
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

      return true
    },
  },
}
