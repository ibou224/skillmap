/**
 * @module hooks/useIdleTimeout
 * @description Hook de déconnexion automatique après inactivité. Surveille les
 * événements d'activité utilisateur et déclenche `signOut` après 30 minutes
 * sans interaction.
 */

import { useEffect, useRef } from "react"
import { signOut } from "next-auth/react"

/** Durée d'inactivité avant déconnexion automatique (ms). */
const TIME = 30 * 60 * 1000

/**
 * Déconnecte l'utilisateur après une période d'inactivité.
 * À monter une fois dans un layout authentifié ; ne retourne rien.
 * @returns {void}
 */
export function useIdleTimeout() {
  const timer = useRef(null)

  const reset = () => {
    clearTimeout(timer.current)
    timer.current = setTimeout(() => {
      signOut({ callbackUrl: "/login" })
    }, TIME)
  }

  useEffect(() => {
    const events = ["mousemove", "keydown", "click", "scroll", "touchstart"]
    events.forEach(e => window.addEventListener(e, reset))
    reset() 
    return () => {
      clearTimeout(timer.current)
      events.forEach(e => window.removeEventListener(e, reset))
    }
  }, [])
}
