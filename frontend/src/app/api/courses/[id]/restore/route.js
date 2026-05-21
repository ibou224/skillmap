import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma.js';

// ── POST /api/courses/[id]/restore ────────────────────────────────────────────
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
