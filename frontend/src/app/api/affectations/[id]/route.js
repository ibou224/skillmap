// app/api/affectations/[id]/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireRole } from "@/lib/permission";

export async function PATCH(request, { params }) {
  const { error } = await requireRole("RH", "ADMIN");
  if (error) return error;

  const { id } = params;
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "Corps de requête invalide." },
      { status: 400 }
    );
  }

  const { statut } = body;
  if (!statut || !["PROPOSEE", "AJUSTEE", "FINALISEE"].includes(statut)) {
    return NextResponse.json(
      { success: false, message: "Statut invalide ou manquant." },
      { status: 400 }
    );
  }

  try {
    const existing = await prisma.assignment.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Affectation introuvable." },
        { status: 404 }
      );
    }

    // 4. Mise à jour
    const updated = await prisma.assignment.update({
      where: { id },
      data: { statut },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (err) {
    if (err.code === "P2025") {
      return NextResponse.json(
        { success: false, message: "Affectation introuvable." },
        { status: 404 }
      );
    }
    console.error("Erreur mise à jour affectation :", err);
    return NextResponse.json(
      { success: false, message: err.message || "Erreur lors de la mise à jour." },
      { status: 500 }
    );
  }
}