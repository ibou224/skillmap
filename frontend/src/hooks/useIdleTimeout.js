import { useEffect, useRef } from "react"
import { signOut } from "next-auth/react"

const TIME = 30 * 60 * 1000 
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
