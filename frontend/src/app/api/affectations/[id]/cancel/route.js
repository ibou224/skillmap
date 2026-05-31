/**
 * @module app/api/affectations/[id]/cancel/route
 * @description Route API d'annulation d'une affectation finalisée (passe le statut
 * à ANNULEE avec un motif), réservée aux administrateurs.
 */

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireRole, getIp } from "@/lib/permission";

/**
 * Annule une affectation finalisée.
 *
 * @route POST /api/affectations/[id]/cancel
 * @access ADMIN uniquement
 */
export async function POST(request, { params }) {
  const { session, error } = await requireRole("ADMIN");
  if (error) return error;

  const { id } = await params;

  let motif = "";
  try {
    const body = await request.json();
    motif = body?.motif ?? "";
  } catch {
  }

  try {
    const assignment = await prisma.assignment.findUnique({
      where: { id },
      include: {
        course:    { select: { nom: true, code: true } },
        professor: { include: { user: { select: { prenom: true, nom: true } } } },
        session:   { select: { nom: true } },
      },
    });

    if (!assignment) {
      return NextResponse.json(
        { success: false, message: "Affectation introuvable." },
        { status: 404 }
      );
    }

    if (assignment.statut !== "FINALISEE") {
      return NextResponse.json(
        { success: false, message: `Seules les affectations finalisées peuvent être annulées (statut actuel : ${assignment.statut}).` },
        { status: 400 }
      );
    }

    const updated = await prisma.assignment.update({
      where: { id },
      data:  { statut: "ANNULEE", notes: motif || assignment.notes },
    });

    await prisma.auditLog.create({
      data: {
        action:     "CANCEL",
        entityType: "AFFECTATION",
        entityId:   id,
        userId:     session.user.id,
        metadata: {
          email:      session.user.email,
          role:       session.user.role,
          message:    "Affectation finalisée annulée par l'administrateur",
          professeur: `${assignment.professor.user.prenom} ${assignment.professor.user.nom}`,
          cours:      assignment.course.nom,
          session:    assignment.session.nom,
          motif,
        },
        ipAddress: getIp(request),
      },
    });

    return NextResponse.json({
      success: true,
      message: `Affectation annulée — ${assignment.course.nom} / ${assignment.professor.user.prenom} ${assignment.professor.user.nom}.`,
      data: updated,
    });

  } catch (err) {
    console.error("Erreur annulation affectation :", err);
    return NextResponse.json(
      { success: false, message: "Erreur serveur." },
      { status: 500 }
    );
  }
}
