/**
 * @module app/api/history/route
 * @description Route API de l'historique des affectations FINALISEE, filtrable par
 * session/professeur/cours. Un professeur ne voit que ses propres affectations.
 */

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireRole } from "@/lib/permission";

/**
 * Route GET /api/history — liste l'historique des affectations finalisées.
 *
 * @access ADMIN, RH, PROFESSEUR (un professeur est restreint à ses affectations)
 * @param {Request} request - Requête HTTP ; query optionnels `sessionId`, `professorId`, `courseId`.
 * @returns {NextResponse} 200 avec l'historique, 404 si profil professeur introuvable, 500 sur erreur.
 */
export async function GET(request) {
  const { session, error } = await requireRole("ADMIN", "RH", "PROFESSEUR");
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("sessionId");
  const professorId = searchParams.get("professorId");
  const courseId = searchParams.get("courseId");
  // L'historique n'affiche que les affectations finalisées
  // Les PROPOSEE / AJUSTEE sont visibles dans la page Affectations

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
        statut: "FINALISEE",
        ...(sessionId          ? { sessionId }                       : {}),
        ...(resolvedProfessorId ? { professorId: resolvedProfessorId } : {}),
        ...(courseId           ? { courseId }                        : {}),
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
