import { NextResponse } from 'next/server';

/**
 * Route non implémentée — retourne un tableau vide.
 *
 * @route GET /api/cvs
 *
 * @returns {200} Tableau vide `[]`.
 */
export async function GET() {
  return NextResponse.json([]);
}
