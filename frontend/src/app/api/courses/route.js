import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma.js';
import { isValidString } from '@/lib/validation.js';
import { requireRole } from '@/lib/permission.js';

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
  const { error } = await requireRole("ADMIN", "RH");
  if (error) return error;

  try {
    const { searchParams } = new URL(request.url);

    if (searchParams.get("programs") === "true") {
      const programmes = await prisma.program.findMany({
        orderBy: { nom: "asc" },
        select: { id: true, nom: true, code: true },
      });
      return NextResponse.json({ success: true, data: programmes }, { status: 200 });
    }

    const courses = await prisma.course.findMany({
      orderBy: { nom: "asc" },
      include: {
        courseSkills: {
          include: {
            skill: { select: { nom: true } },
          },
        },
        programs: { select: { id: true, nom: true, code: true } },
      },
    });

    return NextResponse.json({ success: true, data: courses }, { status: 200 });

  } catch (error) {
    console.error("[GET_COURSES_ERROR]:", error);
    return NextResponse.json(
      { success: false, error: "Erreur interne du serveur lors de la récupération des données." },
      { status: 500 }
    );
  }
}
