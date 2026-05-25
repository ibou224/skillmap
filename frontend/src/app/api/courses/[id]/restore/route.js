import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma.js';

/**
 * Restaure un cours précédemment archivé.
 *
 * Passe le champ `isArchived` à `false`. Aucune vérification de rôle
 * n'est appliquée sur cette route.
 *
 * @route POST /api/courses/[id]/restore
 *
 * @param {Request} _ - La requête HTTP (non utilisée).
 * @param {{ params: { id: string } }} context - L'identifiant du cours dans l'URL.
 *
 * @returns {200} Le cours restauré avec ses programmes.
 * @returns {404} Cours introuvable.
 * @returns {500} Erreur interne du serveur.
 */
export async function POST(_, { params }) {
  const { id } = await params;
  try {
    const existing = await prisma.course.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, message: 'Cours introuvable' }, { status: 404 });
    }

    const restored = await prisma.course.update({
      where:   { id },
      data:    { isArchived: false },
      include: { programs: { select: { id: true, nom: true } } },
    });

    return NextResponse.json({ success: true, data: restored });
  } catch (error) {
    console.error('[RESTORE_COURSE_ERROR]:', error);
    return NextResponse.json({ success: false, message: 'Erreur interne du serveur' }, { status: 500 });
  }
}
