import { NextResponse } from "next/server";
import prisma from "@/lib/prisma.js";
import { requireRole } from "@/lib/permission.js";
import { isValidateWeights } from "@/lib/validation";

export async function PUT(request) {
  const { session, error } = await requireRole("ADMIN", "RH");
  if (error) return error;

  try {
    const body = await request.json();
    const {
      sessionId,
      competencesPct,
      experiencePct,
      formationPct,
      historiquePct,
    } = body;

    const result = isValidateWeights({
      competencesPct,
      experiencePct,
      formationPct,
      historiquePct,
    });
    if (!result.valid) {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 400 },
      );
    }

    const weight = await prisma.weightsConfig.upsert({
      where: { sessionId },
      create: { sessionId, competencesPct, experiencePct, formationPct, historiquePct },
      update: { competencesPct, experiencePct, formationPct, historiquePct },
    });

    return NextResponse.json({
      success: true,
      message: "Pondérations mises à jour avec succès.",
      data: weight,
    });
  } catch (err) {
    console.error("Erreur lors de la mise à jour des pondérations :", err);
    return NextResponse.json(
      {
        success: false,
        message: "Erreur lors de la mise à jour des pondérations.",
      },
      { status: 500 },
    );
  }
}
