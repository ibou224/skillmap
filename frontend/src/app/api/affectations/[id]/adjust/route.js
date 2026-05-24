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

  const { coursId } = body;
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

    // Vérifier que le cours existe
    const course = await prisma.course.findUnique({ where: { id: coursId } });
    if (!course) {
      return NextResponse.json(
        { success: false, message: "Cours introuvable." },
        { status: 404 }
      );
    }

    const updated = await prisma.assignment.update({
      where: { id },
      data: {
        courseId: coursId,
        statut: "AJUSTEE",
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