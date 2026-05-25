import { NextResponse } from 'next/server';

/**
 * Route non implémentée — retourne simplement l'identifiant reçu.
 *
 * @route GET /api/cvs/[id]
 *
 * @param {Request} request - La requête HTTP.
 * @param {{ params: { id: string } }} context - L'identifiant dans l'URL.
 *
 * @returns {200} Objet `{ id }`.
 */
export async function GET(request, { params }) {
  return NextResponse.json({ id: params.id });
}
