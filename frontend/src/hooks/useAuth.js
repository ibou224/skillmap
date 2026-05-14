'use client'

import { signIn, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

/**
 * @module useAuth
 * @description Hook React pour gérer l'authentification côté client.
 *
 * Encapsule les opérations de connexion et déconnexion via NextAuth,
 * ainsi que les états de chargement et d'erreur associés.
 */

/**
 * @hook useAuth
 * @brief Fournit les fonctions et états liés à l'authentification.
 *
 * @returns {{
 *   login: Function,
 *   logout: Function,
 *   error: string,
 *   loading: boolean
 * }} Les utilitaires d'authentification.
 */
export function useAuth() {
  const router = useRouter()
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)

  /**
   * @brief Authentifie l'utilisateur avec ses identifiants.
   *
   * Appelle NextAuth avec le provider `credentials`. En cas de succès,
   * redirige vers `/dashboard`. En cas d'échec, expose le message
   * d'erreur retourné par `authorize()` via `result.code`.
   *
   * @param {string} email    - Adresse email de l'utilisateur.
   * @param {string} password - Mot de passe de l'utilisateur.
   * @returns {Promise<void>}
   */
  const login = async (email, password) => {
    setError('')
    setLoading(true)

    const result = await signIn('credentials', { email, password, redirect: false })

    setLoading(false)

    if (result?.error) {
      setError(result.code ?? 'Une erreur est survenue')
      return
    }

    router.push('/dashboard')
  }

  /**
   * @brief Déconnecte l'utilisateur et supprime la session NextAuth.
   *
   * Redirige vers `/login` après la déconnexion. La suppression du
   * refresh token en base est gérée par l'event `signOut` dans auth.js.
   *
   * @returns {Promise<void>}
   */
  const logout = async () => {
    await signOut({ callbackUrl: '/login' })
  }

  return { login, logout, error, loading }
}
