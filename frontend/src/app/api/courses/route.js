import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma.js';

/**
 * Récupère la liste des cours ou des programmes selon le paramètre de requête.
 *
 * Si `?programs=true` est passé, retourne uniquement la liste des programmes
 * (id, nom, code), triée alphabétiquement. Sinon, retourne tous les cours
 * avec leurs compétences et leurs programmes associés.
 *
 * @route GET /api/courses
 *
 * @param {Request} request - La requête HTTP.
 * @queryParam {string} [programs] - Passer `"true"` pour ne retourner que les programmes.
 *
 * @returns {200} Liste des cours (avec compétences et programmes) ou liste des programmes seuls.
 * @returns {500} Erreur interne du serveur.
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    if (searchParams.get("programs") === "true") {
      const programmes = await prisma.program.findMany({
        orderBy: { nom: "asc" },
        select: { id: true, nom: true, code: true },
      });
      return NextResponse.json({ success: true, data: programmes }, { status: 200 });
    }

    // Un seul objet include — plusieurs clés include séparées, JS garde seulement la dernière
    const courses = await prisma.course.findMany({
      orderBy: { nom: "asc" },
      include: {
        courseSkills: {
          include: {
            skill: { select: {  nom: true} },
          },
        },
      },
    });

    // Workaround: PrismaPg 7.x driver adapter bug avec l'include implicite M2M.
    const coursePrograms = await prisma.$queryRaw`
      SELECT cp."A" AS "courseId", p.id, p.nom, p.code
      FROM "_CourseToProgram" cp
      JOIN "Program" p ON p.id = cp."B"
    `;

    const programsByCourse = {};
    for (const row of coursePrograms) {
      if (!programsByCourse[row.courseId]) programsByCourse[row.courseId] = [];
      programsByCourse[row.courseId].push({ id: row.id, nom: row.nom, code: row.code });
    }

    const data = courses.map(c => ({ ...c, programs: programsByCourse[c.id] ?? [] }));

    return NextResponse.json({ success: true, data }, { status: 200 });

  } catch (error) {
    console.error("[GET_COURSES_ERROR]:", error);
    return NextResponse.json(
      { success: false, error: "Erreur interne du serveur lors de la récupération des données." },
      { status: 500 }
    );
  }
}
