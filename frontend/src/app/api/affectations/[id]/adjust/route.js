import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireRole, getIp } from "@/lib/permission";

/**
 * Ajuste le cours associé à une affectation existante.
 *
 * Réservé aux RH et administrateurs. Remplace le cours de l'affectation et
 * passe son statut à `AJUSTEE` pour indiquer qu'elle a été modifiée manuellement.
 *
 * @route PATCH /api/affectations/[id]/adjust
 *
 * @param {Request} request - La requête HTTP avec le corps JSON.
 * @param {{ params: { id: string } }} context - L'identifiant de l'affectation dans l'URL.
 *
 * @body {string} coursId - Identifiant du nouveau cours à associer.
 *
 * @returns {200} L'affectation mise à jour.
 * @returns {400} Corps invalide ou `coursId` manquant.
 * @returns {401|403} Non connecté ou rôle insuffisant.
 * @returns {404} Affectation ou cours introuvable.
 * @returns {500} Erreur interne du serveur.
 */
export async function PATCH(request, { params }) {
  const { session, error } = await requireRole("RH", "ADMIN");
  if (error) return error;

  const { id } = await params;
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "Corps de requête invalide." },
      { status: 400 }
    );
  }

  const { coursId, notes } = body;
  if (!coursId) {
    return NextResponse.json(
      { success: false, message: "Le champ 'coursId' est requis." },
      { status: 400 }
    );
  }

  try {
    const existingAssignment = await prisma.assignment.findUnique({ where: { id } });
    if (!existingAssignment) {
      return NextResponse.json(
        { success: false, message: "Affectation introuvable." },
        { status: 404 }
      );
    }

    if (existingAssignment.statut === "FINALISEE") {
      return NextResponse.json(
        { success: false, message: "Une affectation finalisée ne peut pas être ajustée." },
        { status: 400 }
      );
    }

    const course = await prisma.course.findUnique({ where: { id: coursId } });
    if (!course) {
      return NextResponse.json(
        { success: false, message: "Cours introuvable." },
        { status: 404 }
      );
    }

    if (course.isArchived) {
      return NextResponse.json(
        { success: false, message: "Impossible d'affecter un cours archivé." },
        { status: 400 }
      );
    }

    const conflict = await prisma.assignment.findUnique({
      where: {
        sessionId_professorId_courseId: {
          sessionId:   existingAssignment.sessionId,
          professorId: existingAssignment.professorId,
          courseId:    coursId,
        },
      },
    });
    if (conflict && conflict.id !== id) {
      return NextResponse.json(
        { success: false, message: "Ce professeur est déjà affecté à ce cours pour cette session." },
        { status: 409 }
      );
    }

    const updated = await prisma.assignment.update({
      where: { id },
      data:  {
        courseId: coursId,
        statut:   "AJUSTEE",
        notes:    notes?.trim() || null,
      },
    });

    await prisma.auditLog.create({
      data: {
        action:     "UPDATE",
        entityType: "AFFECTATION",
        entityId:   id,
        userId:     session.user.id,
        metadata: {
          email:         session.user.email,
          role:          session.user.role,
          message:       "Affectation ajustée manuellement",
          ancienCoursId: existingAssignment.courseId,
          nouveauCoursId: coursId,
          ancienStatut:  existingAssignment.statut,
          nouveauStatut: "AJUSTEE",
          notes: notes?.trim() || null,
        },
        ipAddress: getIp(request),
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (err) {
    console.error("Erreur ajustement affectation :", err);
    return NextResponse.json(
      { success: false, message: err.message || "Erreur lors de l'ajustement." },
      { status: 500 }
    );
  }
}
