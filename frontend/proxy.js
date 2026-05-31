import NextAuth from 'next-auth'
import { authConfig } from '@/lib/auth.config'
import {auth} from "@/lib/auth.js";

// Utilise uniquement la config Edge-compatible (sans Prisma)
export default NextAuth(authConfig).auth

export const proxy = auth((req) =>{
  
})

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
}
