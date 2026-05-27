import { NextResponse } from "next/server";
import prisma from "@/lib/prisma.js";
import { requireRole, getIp } from "@/lib/permission.js";
import { isValidateWeights } from "@/lib/validation";

/**
 * Crée ou met à jour la configuration de pondération d'une session.
 *
 * @route PUT /api/weights/update
 * @access ADMIN, RH
 */
export async function PUT(request) {
  const { session, error } = await requireRole("ADMIN", "RH");
  if (error) return error;

  try {
    const body = await request.json();
    const { sessionId, competencesPct, experiencePct, formationPct, historiquePct } = body;

    if (!sessionId) {
      return NextResponse.json(
        { success: false, message: "Le champ 'sessionId' est requis." },
        { status: 400 },
      );
    }

    const existingSession = await prisma.session.findUnique({ where: { id: sessionId } });
    if (!existingSession) {
      return NextResponse.json(
        { success: false, message: "Session introuvable." },
        { status: 404 },
      );
    }

    const result = isValidateWeights({ competencesPct, experiencePct, formationPct, historiquePct });
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

    await prisma.auditLog.create({
      data: {
        action: "UPDATE",
        entityType: "PONDERATION",
        entityId: sessionId,
        userId: session.user.id,
        metadata: {
          email: session.user.email,
          role: session.user.role,
          message: "Pondérations mises à jour",
          sessionNom: existingSession.nom,
          competencesPct,
          experiencePct,
          formationPct,
          historiquePct,
        },
        ipAddress: getIp(request),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Pondérations mises à jour avec succès.",
      data: weight,
    });
  } catch (err) {
    console.error("Erreur lors de la mise à jour des pondérations :", err);
    return NextResponse.json(
      { success: false, message: "Erreur lors de la mise à jour des pondérations." },
      { status: 500 },
    );
  }
}
