import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireRole } from "@/lib/permission";

/**
 * Active une session en passant son statut à ACTIVE.
 * Toute autre session actuellement ACTIVE est d'abord passée en TERMINEE.
 *
 * @route PUT /api/sessions/[id]/activate
 *
 * @param {Request} request
 * @param {{ params: { id: string } }} context
 *
 * @returns {200} La session activée.
 * @returns {401|403} Non connecté ou rôle insuffisant.
 * @returns {404} Session introuvable.
 * @returns {409} Session déjà active.
 * @returns {500} Erreur interne.
 */
export async function PUT(_request, { params }) {
  const { error } = await requireRole("ADMIN", "RH");
  if (error) return error;

  const { id } = params;

  try {
    const session = await prisma.session.findUnique({ where: { id } });
    if (!session) {
      return NextResponse.json(
        { success: false, message: "Session introuvable." },
        { status: 404 }
      );
    }

    if (session.statut === "ACTIVE") {
      return NextResponse.json(
        { success: false, message: "Cette session est déjà active." },
        { status: 409 }
      );
    }

    // Passer toutes les sessions ACTIVE en ARCHIVEE, puis activer celle-ci
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