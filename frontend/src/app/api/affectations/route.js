import { NextResponse } from 'next/server';
import prisma from "@/lib/prisma.js";
import { requireRole } from "@/lib/permission.js";

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

  try {
    if (session.user.role === "PROFESSEUR") {
      return await getProfesseurAffectations(session);
    }

    return await getRHAffectations(professeurId);

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
    include: {
      course:    { select: COURSE_SELECT },
      professor: { select: PROFESSOR_SELECT },
    },
    orderBy: [{ course: { code: 'asc' } }],
  });

  return NextResponse.json({
    success: true,
    data: flattenAssignments(affectations),
  });
}

async function getRHAffectations(professeurId) {
  const where = professeurId ? { professorId: professeurId } : {};

  const affectations = await prisma.assignment.findMany({
    where,
    include: {
      course:    { select: COURSE_SELECT },
      professor: { select: PROFESSOR_SELECT },
    },
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
    sessionId: a.sessionId,
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
