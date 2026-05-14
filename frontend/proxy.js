import NextAuth from 'next-auth'
import { authConfig } from '@/lib/auth.config'

// Utilise uniquement la config Edge-compatible (sans Prisma)
export default NextAuth(authConfig).auth

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
}
