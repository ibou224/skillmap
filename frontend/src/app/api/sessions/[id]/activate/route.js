/**
 * @module app/api/sessions/[id]/activate/route
 * @description Route API d'activation d'une session (archive les autres sessions actives).
 */

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireRole, getIp } from "@/lib/permission";

/**
 * Active une session en passant son statut à ACTIVE.
 * Toute autre session actuellement ACTIVE est d'abord passée en ARCHIVEE.
 *
 * @route PUT /api/sessions/[id]/activate
 * @access ADMIN, RH
 */
export async function PUT(request, { params }) {
  const { session: authSession, error } = await requireRole("ADMIN", "RH");
  if (error) return error;

  const { id } = await params;

  try {
    const existing = await prisma.session.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Session introuvable." },
        { status: 404 }
      );
    }

    if (existing.statut === "ACTIVE") {
      return NextResponse.json(
        { success: false, message: "Cette session est déjà active." },
        { status: 409 }
      );
    }

    await prisma.$transaction([
      prisma.session.updateMany({
        where: { statut: "ACTIVE" },
        data: { statut: "ARCHIVEE" },
      }),
      prisma.session.update({
        where: { id },
        data: { statut: "ACTIVE" },
      }),
    ]);

    const updated = await prisma.session.findUnique({ where: { id } });

    await prisma.auditLog.create({
      data: {
        action: "UPDATE",
        entityType: "SESSION",
        entityId: id,
        userId: authSession.user.id,
        metadata: {
          email: authSession.user.email,
          role: authSession.user.role,
          message: "Session activée",
          sessionNom: updated.nom,
          ancienStatut: existing.statut,
          nouveauStatut: "ACTIVE",
        },
        ipAddress: getIp(request),
      },
    });

    return NextResponse.json(
      { success: true, data: updated, message: `Session "${updated.nom}" activée.` },
      { status: 200 }
    );
  } catch (err) {
    console.error("Erreur PUT /api/sessions/[id]/activate:", err);
    return NextResponse.json(
      { success: false, message: "Erreur serveur." },
      { status: 500 }
    );
  }
}
