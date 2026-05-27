import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireRole } from "@/lib/permission";

const STATUTS = ["PROPOSEE", "AJUSTEE", "FINALISEE"];

export async function GET(request) {
  const { session, error } = await requireRole("ADMIN", "RH", "PROFESSEUR");
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("sessionId");
  const professorId = searchParams.get("professorId");
  const courseId = searchParams.get("courseId");
  const statut = searchParams.get("statut");

  if (statut && !STATUTS.includes(statut)) {
    return NextResponse.json(
      { success: false, message: "Statut invalide." },
      { status: 400 }
    );
  }

  try {
    let resolvedProfessorId = professorId;

    if (session.user.role === "PROFESSEUR") {
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

      resolvedProfessorId = professor.id;
    }

    const assignments = await prisma.assignment.findMany({
      where: {
        ...(sessionId ? { sessionId } : {}),
        ...(resolvedProfessorId ? { professorId: resolvedProfessorId } : {}),
        ...(courseId ? { courseId } : {}),
        ...(statut ? { statut } : {}),
      },
      orderBy: [
        { session: { dateDebut: "desc" } },
        { session: { nom: "asc" } },
        { course: { code: "asc" } },
      ],
      include: {
        session: {
          select: {
            id: true,
            nom: true,
            statut: true,
            annee: true,
            periode: true,
            dateDebut: true,
            dateFin: true,
          },
        },
        course: {
          select: {
            id: true,
            code: true,
            nom: true,
            etape: true,
            programs: {
              select: { id: true, code: true, nom: true },
            },
          },
        },
        professor: {
          select: {
            id: true,
            user: {
              select: {
                id: true,
                prenom: true,
                nom: true,
                email: true,
              },
            },
          },
        },
      },
    });

    const data = assignments.map((assignment) => ({
      id: assignment.id,
      score: assignment.score,
      scoreDetail: assignment.scoreDetail,
      statut: assignment.statut,
      createdAt: assignment.createdAt,
      updatedAt: assignment.updatedAt,
      session: assignment.session,
      course: assignment.course,
      professor: {
        id: assignment.professor.id,
        userId: assignment.professor.user.id,
        prenom: assignment.professor.user.prenom,
        nom: assignment.professor.user.nom,
        email: assignment.professor.user.email,
      },
    }));

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error("GET /api/history :", err);
    return NextResponse.json(
      { success: false, message: "Erreur serveur." },
      { status: 500 }
    );
  }
}
