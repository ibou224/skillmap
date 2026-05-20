import { NextResponse } from 'next/server';
import prisma from "@/lib/prisma.js";
import { requireRole } from "@/lib/permission.js";
import { normalizeAssignments } from "@/lib/formatData.js";

const SESSION_SELECT = {
  id: true,
  nom: true,
  annee: true,
  periode: true,
  statut: true,
  dateDebut: true,
  dateFin: true,
};

const COURSE_SELECT = {
  code: true,
  nom: true,
  etape: true,
  programs: { select: { code: true, nom: true } },
};

const PROFESSOR_SELECT = {
  id: true,
  user: { select: { nom: true, prenom: true, email: true } },
};

export async function GET(request) {
  const { session, error } = await requireRole("PROFESSEUR", "RH");
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
      session: { select: SESSION_SELECT },
      course: { select: COURSE_SELECT },
      professor: { select: PROFESSOR_SELECT },
    },
    orderBy: [
      { session: { dateDebut: 'desc' } },
      { course: { code: 'asc' } },
    ]
  });

  return NextResponse.json({
    success: true,
    data: normalizeAssignments(affectations),
  });
}

async function getRHAffectations(professeurId) {
  const where = professeurId ? { professorId: professeurId } : {};

  const affectations = await prisma.assignment.findMany({
    where,
    include: {
      session: { select: SESSION_SELECT },
      course: { select: COURSE_SELECT },
      professor: { select: PROFESSOR_SELECT },
    },
    orderBy: [
      { session: { dateDebut: 'desc' } },
      { professor: { user: { nom: 'asc' } } },
      { course: { code: 'asc' } },
    ]
  });

  return NextResponse.json({
    success: true,
    data: normalizeAssignments(affectations),
  });
}
