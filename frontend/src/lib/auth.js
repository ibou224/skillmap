import NextAuth, { CredentialsSignin } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import prisma from '@/lib/prisma'
import { authConfig } from './auth.config'

const ACCESS_TOKEN_DURATION  = 15 * 60
const REFRESH_TOKEN_DURATION = 7 * 24 * 60 * 60 

// classe pour gerer les erreur personnalises
class PersonnaliseError extends CredentialsSignin{
  constructor(message) {
    super()
    this.code = message
  }
}
// Fonction pour generer le refresh token
const  createRefreshToken = async (userId)  => {
  const token   = crypto.randomBytes(32).toString('hex')
  const hash    = await bcrypt.hash(token, 10)
  const expires = new Date(Date.now() + REFRESH_TOKEN_DURATION * 1000)

  await prisma.user.update({
    where: { id: userId },
    data:  { 
        refreshTokenHash: hash, 
        refreshExpiresAt: expires 
    },
  })

  return token
}

// Renouvelle l'access token via le refresh token
const refreshAccessToken = async (token) => {
  try {
    const user = await prisma.user.findUnique({
      where:  { id: token.id },
      select: { 
        refreshTokenHash: true,
        refreshExpiresAt: true, 
        isActive: true },
    })

    if (!user || !user.isActive)          throw new Error('Utilisateur invalide')
    if (!user.refreshTokenHash)           throw new Error('Aucun refresh token en base')
    if (user.refreshExpiresAt < new Date()) throw new Error('Refresh token expiré')

    const valide = await bcrypt.compare(token.refreshToken, user.refreshTokenHash)
    if (!valide) throw new Error('Refresh token invalide')

    const nouveauRefreshToken = await createRefreshToken(token.id)

    return {
      ...token,
      accessTokenExpires: Date.now() + ACCESS_TOKEN_DURATION * 1000,
      refreshToken: nouveauRefreshToken,
      error: undefined,
    }
  } catch {

    return { ...token, error: 'RefreshTokenError' }
  }
}


export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email:    { 
            label: 'Email',        
            type: 'email',    
            placeholder: 'admin@lacitec.on.ca' 
        },
        password: { 
            label: 'Mot de passe', 
            type: 'password', 
            placeholder: '••••••••' 
        },
      },

      authorize: async (credentials) => {
        if (!credentials?.email || !credentials?.password) return null

          const user = await prisma.user.findUnique({
            where:   { email: credentials.email },
            include: { professor: true },
          })

          if (!user || !user.isActive) {
            throw new PersonnaliseError("Email ou mot de passe incorrect")
          }
          if (user.lockedUntil && user.lockedUntil > new Date()) {
            throw new PersonnaliseError("Compte verrouillé")
          }

          const passwordOk = await bcrypt.compare(credentials.password, user.passwordHash)

          if (!passwordOk) {
            await prisma.user.update({
              where: { id: user.id },
              data: {
                loginAttempts: user.loginAttempts + 1,
                lockedUntil: user.loginAttempts + 1 >= 5
                  ? new Date(Date.now() + 30 * 60 * 1000)
                  : null,
              },
            })
            throw new PersonnaliseError("Email ou mot de passe incorrect")
          }

          const refreshToken = await createRefreshToken(user.id)

          await prisma.user.update({
            where: { id: user.id },
            data:  { loginAttempts: 0, lockedUntil: null, lastLoginAt: new Date() },
          })

          return {
            id:           user.id,
            email:        user.email,
            role:         user.role,
            nom:          user.professor?.nom    || '',
            prenom:       user.professor?.prenom || '',
            refreshToken,
          }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      // Première connexion : initialiser le token avec les données de authorize()
      if (user) {
        return {
          ...token,
          id:                 user.id,
          role:               user.role,
          nom:                user.nom,
          prenom:             user.prenom,
          refreshToken:       user.refreshToken,
          accessTokenExpires: Date.now() + ACCESS_TOKEN_DURATION * 1000,
        }
      }

      // Access token encore valide → rien à faire
      if (Date.now() < token.accessTokenExpires) {
        return token
      }

      // Access token expiré → tenter le renouvellement via le refresh token
      return refreshAccessToken(token)
    },

    async session({ session, token }) {
      session.user.id     = token.id
      session.user.role   = token.role
      session.user.nom    = token.nom
      session.user.prenom = token.prenom
      session.error       = token.error
      return session
    },
  },

  pages: {
    signIn: '/login',
    error:  '/login',
  },

  session: {
    strategy: 'jwt',
    maxAge: REFRESH_TOKEN_DURATION,
  },

  events: {
    async signOut({ token }) {
      if (token?.id) {
        try {
          await prisma.user.update({
            where: { id: token.id },
            data:  { refreshTokenHash: null, refreshExpiresAt: null },
          })
        } catch (error) {
          console.error('Échec de la suppression du refresh token lors de la déconnexion :', error)
        }
      }
    },
  },
})
