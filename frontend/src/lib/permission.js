/**
 * @module lib/permission
 * @description Helpers d'autorisation pour les route handlers : vérification du
 * rôle de l'utilisateur authentifié et extraction de l'adresse IP cliente.
 */

import { auth } from './auth.js'
import { NextResponse } from 'next/server'

/**
 * Vérifie que l'utilisateur est authentifié et possède l'un des rôles autorisés.
 *
 * Usage dans un route handler :
 *   const { session, error } = await requireRole(request, 'ADMIN')
 *   if (error) return error
 *
 * @param {...string} roles  - Rôles autorisés ('ADMIN', 'RH', 'PROFESSEUR').
 * @returns {Promise<{ session: import('next-auth').Session } | { error: NextResponse }>}
 */
export async function requireRole(...roles) {
  const session = await auth() 

  if (!session?.user) {
    return {
      error: NextResponse.json(
        { success: false, message: 'Authentification requise.' },
        { status: 401 },
      ),
    }
  }

  if (!roles.includes(session.user.role)) {
    return {
      error: NextResponse.json(
        { success: false, message: 'Accès refusé.' },
        { status: 403 },
      ),
    }
  }

  return { session }
}

/**
 * Extrait l'adresse IP du client à partir des en-têtes de proxy.
 * Privilégie `x-forwarded-for` (première entrée) puis `x-real-ip`.
 *
 * @param {Request} request - La requête entrante.
 * @returns {string|null} L'adresse IP, ou null si indéterminable.
 */
export function getIp(request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? null;
}
