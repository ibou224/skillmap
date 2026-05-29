import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireRole, getIp } from "@/lib/permission";


export async function PATCH(request) {
  const { session, error } = await requireRole("RH", "ADMIN");
  if (error) return error;

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "Corps de requete invalide." },
      { status: 400 },
    );
  }

  const { sessionId } = body ?? {};
  if (!sessionId) {
    return NextResponse.json(
      { success: false, message: "sessionId est requis." },
      { status: 400 },
    );
  }

  try {
    const academicSession = await prisma.session.findUnique({
      where: { id: sessionId },
      select: { id: true, nom: true },
    });

    if (!academicSession) {
      return NextResponse.json(
        { success: false, message: "Session introuvable." },
        { status: 404 },
      );
    }

    const counts = await prisma.assignment.groupBy({
      by: ["statut"],
      where: { sessionId },
      _count: { _all: true },
    });

    const countByStatus = Object.fromEntries(
      counts.map((item) => [item.statut, item._count._all]),
    );

    const finalizableCount =
      (countByStatus.AJUSTEE ?? 0) + (countByStatus.PROPOSEE ?? 0);

    if (finalizableCount === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Aucune affectation à finaliser pour cette session.",
        },
        { status: 409 },
      );
    }

    // Charger les détails AVANT le updateMany (pour les emails)
    const toFinalize = await prisma.assignment.findMany({
      where: { sessionId, statut: { in: ["PROPOSEE", "AJUSTEE"] } },
      include: {
        course: { select: { nom: true, code: true, etape: true } },
        professor: {
          include: {
            user: { select: { prenom: true, nom: true, email: true } },
          },
        },
        session: { select: { nom: true } },
      },
    });

    const result = await prisma.assignment.updateMany({
      where: { sessionId, statut: { in: ["PROPOSEE", "AJUSTEE"] } },
      data: { statut: "FINALISEE" },
    });

    await prisma.auditLog.create({
      data: {
        action: "FINALIZE",
        entityType: "AFFECTATION",
        entityId: sessionId,
        userId: session.user.id,
        metadata: {
          email: session.user.email,
          role: session.user.role,
          message: "Finalisation globale des affectations",
          sessionNom: academicSession.nom,
          affectationsFinalisees: result.count,
        },
        ipAddress: getIp(request),
      },
    });
    await prisma.notification.createMany({
      data: toFinalize.map((a) => ({
        userId: a.professor.userId,
        type: "AFFECTATION_FINALISEE",
        title: `Affectation confirmée — ${a.course.nom}`,
        body: `Session ${a.session?.nom ?? ""}`,
        link: "/dashboard/professeur/affectations",
      })),
    });

    return NextResponse.json({
      success: true,
      message: `${result.count} affectation(s) finalisee(s).`,
      data: { count: result.count },
    });
  } catch (err) {
    console.error("Erreur finalisation affectations :", err);
    return NextResponse.json(
      {
        success: false,
        message: err.message || "Erreur lors de la finalisation.",
      },
      { status: 500 },
    );
  }
}
