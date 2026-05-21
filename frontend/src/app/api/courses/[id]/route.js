import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma.js';
import { isValidString } from '@/lib/validation';

// ── PUT /api/courses/[id] ─────────────────────────────────────────────────────
export async function PUT(request, { params }) {
  const { id } = await params;
  try {
    const body = await request.json();
    const { nom, code, etape, programIds, courseSkills } = body;

    const nomCheck = isValidString(nom ?? '');
    if (!nomCheck.valid) {
      return NextResponse.json({ success: false, message: nomCheck.message }, { status: 400 });
    }

    const etapeNum = Number(etape);
    if (!Number.isInteger(etapeNum) || etapeNum < 1 || etapeNum > 6) {
      return NextResponse.json({ success: false, message: 'Étape invalide (entier de 1 à 6)' }, { status: 400 });
    }

    const existing = await prisma.course.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, message: 'Cours introuvable' }, { status: 404 });
    }

    if (code && code.trim() !== existing.code) {
      const conflict = await prisma.course.findUnique({ where: { code: code.trim() } });
      if (conflict) {
        return NextResponse.json({ success: false, message: `Le code "${code}" est déjà utilisé` }, { status: 409 });
      }
    }

    const data = {
      nom:   nom.trim(),
      etape: etapeNum,
      ...(code ? { code: code.trim() } : {}),
      ...(Array.isArray(programIds) && programIds.length > 0
        ? { programs: { set: programIds.map(pid => ({ id: pid })) } }
        : {}),
    };

    const updated = await prisma.course.update({ where: { id }, data });

    // Remplace les compétences si fournies (delete + recreate)
    if (Array.isArray(courseSkills)) {
      await prisma.courseSkill.deleteMany({ where: { courseId: id } });
      if (courseSkills.length > 0) {
        await prisma.courseSkill.createMany({
          data: courseSkills.map(s => ({
            courseId:      id,
            skillId:       s.skillId,
            niveauRequis:  s.niveauRequis  ?? 'DEBUTANT',
            poidsCritique: s.poidsCritique ?? 1,
          })),
        });
      }
    }

    // Fetch programs via raw SQL (PrismaPg 7.x driver adapter bug with implicit M2M include).
    const rows = await prisma.$queryRaw`
      SELECT p.id, p.nom
      FROM "_CourseToProgram" cp
      JOIN "Program" p ON p.id = cp."B"
      WHERE cp."A" = ${id}
    `;

    return NextResponse.json({ success: true, data: { ...updated, programs: rows } });
  } catch (error) {
    console.error('[PUT_COURSE_ERROR]:', error);
    if (error.code === 'P2002') {
      return NextResponse.json({ success: false, message: 'Conflit : ce code existe déjà' }, { status: 409 });
    }
    return NextResponse.json({ success: false, message: 'Erreur interne du serveur' }, { status: 500 });
  }
}

// ── DELETE /api/courses/[id] — archivage logique ──────────────────────────────
export async function DELETE(_, { params }) {
  const { id } = await params;
  try {
    const existing = await prisma.course.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, message: 'Cours introuvable' }, { status: 404 });
    }

    const archived = await prisma.course.update({
      where: { id },
      data:  { isArchived: true },
    });

    return NextResponse.json({ success: true, data: archived });
  } catch (error) {
    console.error('[DELETE_COURSE_ERROR]:', error);
    return NextResponse.json({ success: false, message: 'Erreur interne du serveur' }, { status: 500 });
  }
}
