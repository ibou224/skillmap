'use client'

import { signIn, signOut } from 'next-auth/react'
import { useState } from 'react'
import { isValidEmail } from '@/lib/validation'


/**
 * @module useAuth
 * @description Hook React pour gérer l'authentification côté client.
 *
 * Encapsule les opérations de connexion et déconnexion via NextAuth,
 * ainsi que les états de chargement et d'erreur associés.
 */

/**
 * @hook useLogin
 * @brief Fournit les fonctions et états liés à la connexion.
 *
 * @returns {{
 *   login: Function,
 *   logout: Function,
 *   error: string,
 *   isLoading: boolean
 * }} Les utilitaires d'authentification.
 */
export function useLogin() {
  const [error, setError]     = useState('')
  const [isLoading, setIsLoading] = useState(false)

  /**
   * @brief Authentifie l'utilisateur avec ses identifiants.
   *
   * Appelle NextAuth avec le provider `credentials`. En cas de succès,
   * redirige vers `/` et le middleware se charge de rediriger l'utilisateur vers le dashboard 
   * correspondant. En cas d'échec, expose le message
   * d'erreur retourné par `authorize()` via `result.error`.
   *
   * @param {string} email    - Adresse email de l'utilisateur.
   * @param {string} password - Mot de passe de l'utilisateur.
   * @returns {Promise<void>}
   */
  const login = async (email, password) => {
    setError('')
    setIsLoading(true)

    const emailValidation = isValidEmail(email)
    if (!emailValidation.valid) {
      setError(emailValidation.message)
      setIsLoading(false)
      setTimeout(() => setError(''), 3000)
      return
    }

    let result
    try {
      result = await signIn('credentials', { email: email.trim(), password: password.trim(), redirect: false })
    } catch {
      setIsLoading(false)
      setError('Identifiants incorrects. Veuillez réessayer.')
      setTimeout(() => setError(''), 3000)
      return
    }

    setIsLoading(false)
    if (result?.error) {
      setError(result.code || 'Identifiants incorrects. Veuillez réessayer.')
      setTimeout(() => setError(''), 3000)
      return
    }

    window.location.assign('/dashboard')
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

  return { login, logout, error, isLoading }
}
