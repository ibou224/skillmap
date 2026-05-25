import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireRole } from "@/lib/permission";

/**
 * Valide une extraction de CV en passant son statut de EXTRACTED à VALIDATED.
 *
 * @route PUT /api/cvs/[id]/validate
 * @access RH, ADMIN
 *
 * @param {Request} _request
 * @param {{ params: { id: string } }} context
 *
 * @returns {200} L'extraction mise à jour.
 * @returns {400} Statut incompatible (doit être EXTRACTED).
 * @returns {401|403} Non connecté ou rôle insuffisant.
 * @returns {404} Extraction introuvable.
 * @returns {500} Erreur interne.
 */
export async function PUT(_request, { params }) {
  const { error } = await requireRole("RH", "ADMIN");
  if (error) return error;

  const { id } = params;

  try {
    const extraction = await prisma.cvExtraction.findUnique({ where: { id } });
    if (!extraction) {
      return NextResponse.json(
        { success: false, message: "Extraction introuvable." },
        { status: 404 }
      );
    }

    if (extraction.status !== "EXTRACTED") {
      return NextResponse.json(
        { success: false, message: `Statut invalide : attendu EXTRACTED, reçu ${extraction.status}.` },
        { status: 400 }
      );
    }

    const updated = await prisma.cvExtraction.update({
      where: { id },
      data: { status: "VALIDATED", validatedAt: new Date() },
    });

    return NextResponse.json({ success: true, data: updated }, { status: 200 });
  } catch (err) {
    console.error("Erreur PUT /api/cvs/[id]/validate:", err);
    return NextResponse.json(
      { success: false, message: "Erreur serveur." },
      { status: 500 }
    );
  }
}