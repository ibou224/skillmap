import { NextResponse } from 'next/server';
import prisma from "@/lib/prisma.js";
import { requireRole } from "@/lib/permission.js";

/**
 * Récupère la liste des affectations selon le rôle de l'utilisateur connecté.
 *
 * - **PROFESSEUR** : retourne uniquement ses propres affectations.
 * - **RH / ADMIN** : retourne toutes les affectations, avec filtre optionnel par professeur.
 *
 * @route GET /api/affectations
 *
 * @param {Request} request - La requête HTTP.
 * @queryParam {string} [professeurId] - (RH/ADMIN uniquement) Filtre par identifiant de professeur.
 *
 * @returns {200} Liste des affectations avec le détail du cours et du professeur.
 * @returns {401|403} Non connecté ou rôle insuffisant.
 * @returns {404} Profil professeur introuvable (pour le rôle PROFESSEUR).
 * @returns {500} Erreur interne du serveur.
 */
const SESSION_SELECT = { id: true, nom: true, statut: true };

const COURSE_SELECT = {
  id: true,
  code: true,
  nom: true,
  etape: true,
  programs: { select: { id: true, code: true, nom: true } },
};

const PROFESSOR_SELECT = {
  id: true,
  user: { select: { nom: true, prenom: true, email: true } },
  skills: { select: { skill: { select: { nom: true } } } },
};

export async function GET(request) {
  const { session, error } = await requireRole("PROFESSEUR", "RH","ADMIN");
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const professeurId = searchParams.get('professeurId');
  const sessionId    = searchParams.get('sessionId');

  try {
    if (session.user.role === "PROFESSEUR") {
      return await getProfesseurAffectations(session);
    }

    return await getRHAffectations(professeurId, sessionId);

  } catch (err) {
    console.error("Erreur lors de la récupération des affectations :", err);
    return NextResponse.json({
      success: false,
      message: "Erreur lors de la récupération des affectations.",
    }, { status: 500 });
  }
}

async function getProfesseurAffectations(session) {
  const professor = await prisma.professor.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });

  if (!professor) {
    return NextResponse.json(
      { success: false, message: "Profil professeur introuvable." },
      { status: 404 }
    );
  }

  const affectations = await prisma.assignment.findMany({
    where: { professorId: professor.id },
    include: { course: { select: COURSE_SELECT }, professor: { select: PROFESSOR_SELECT }, session: { select: SESSION_SELECT } },
    orderBy: [{ course: { code: 'asc' } }],
  });

  return NextResponse.json({
    success: true,
    data: flattenAssignments(affectations),
  });
}

async function getRHAffectations(professeurId, sessionId) {
  const where = {
    ...(professeurId && { professorId: professeurId }),
    ...(sessionId    && { sessionId }),
  };

  const affectations = await prisma.assignment.findMany({
    where,
    include: { course: { select: COURSE_SELECT }, professor: { select: PROFESSOR_SELECT }, session: { select: SESSION_SELECT } },
    orderBy: [{ course: { code: 'asc' } }],
  });

  return NextResponse.json({
    success: true,
    data: flattenAssignments(affectations),
  });
}

function flattenAssignments(assignments) {
  return assignments.map((a) => ({
    id:        a.id,
    sessionId:  a.sessionId,
    sessionNom: a.session?.nom ?? null,
    statut:    a.statut,
    score:     a.score,
    scoreDetail: a.scoreDetail,
    cours: {
      id:         a.course.id,
      code:       a.course.code,
      nom:        a.course.nom,
      etape:      a.course.etape,
      programmes: a.course.programs ?? [],
    },
    professeur: {
      id:          a.professor.id,
      prenom:      a.professor.user.prenom,
      nom:         a.professor.user.nom,
      email:       a.professor.user.email,
      competences: a.professor.skills.map((s) => s.skill.nom),
    },
  }));
}
