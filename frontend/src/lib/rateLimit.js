/**
 * rateLimit.js
 * Rate limiter en mémoire pour les routes API sensibles.
 *
 * Utilise globalThis pour survivre aux hot-reloads Next.js.
 * Pour un déploiement multi-instance, migrer vers Redis (Upstash, etc.).
 */

import { NextResponse } from "next/server";

const g = globalThis;
if (!g.__skillmap_rate_limits) g.__skillmap_rate_limits = new Map();

/** @type {Map<string, { count: number, resetAt: number }>} */
const store = g.__skillmap_rate_limits;

// Nettoyage périodique toutes les 10 minutes
if (!g.__skillmap_rate_cleanup) {
  g.__skillmap_rate_cleanup = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store) {
      if (entry.resetAt <= now) store.delete(key);
    }
  }, 10 * 60 * 1000);
}

/**
 * Vérifie si une clé dépasse la limite autorisée.
 *
 * @param {string}  key       Clé unique : ex. `userId:route` ou `ip:route`
 * @param {number}  max       Nombre maximum de requêtes dans la fenêtre
 * @param {number}  windowMs  Durée de la fenêtre en ms (défaut : 60 000 = 1 min)
 * @returns {{ allowed: boolean, retryAfterSec?: number }}
 */
export function checkRateLimit(key, max = 10, windowMs = 60_000) {
  const now   = Date.now();
  const entry = store.get(key);

  if (!entry || entry.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true };
  }

  if (entry.count >= max) {
    return {
      allowed:       false,
      retryAfterSec: Math.ceil((entry.resetAt - now) / 1000),
    };
  }

  entry.count++;
  return { allowed: true };
}

/**
 * Retourne une réponse HTTP 429 standardisée.
 * @param {number} retryAfterSec
 */
export function rateLimitResponse(retryAfterSec) {
  return NextResponse.json(
    {
      success: false,
      message: `Trop de requêtes. Réessayez dans ${retryAfterSec} seconde(s).`,
    },
    {
      status:  429,
      headers: { "Retry-After": String(retryAfterSec) },
    }
  );
}
