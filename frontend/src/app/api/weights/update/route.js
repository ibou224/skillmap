import { NextResponse } from "next/server";
import prisma from "@/lib/prisma.js";
import { requireRole } from "@/lib/permission.js";
import { isValidateWeights } from "@/lib/validation";

/**
 * Crée ou met à jour la configuration de pondération d'une session.
 *
 * Réservé aux administrateurs et RH. Utilise un `upsert` : si une configuration
 * existe déjà pour cette session, elle est mise à jour ; sinon, elle est créée.
 * Les quatre pourcentages sont validés avant toute écriture en base.
 *
 * @route PUT /api/weights/update
 *
 * @param {Request} request - La requête HTTP avec le corps JSON.
 *
 * @body {string} sessionId       - Identifiant de la session concernée.
 * @body {number} competencesPct  - Pourcentage alloué aux compétences.
 * @body {number} experiencePct   - Pourcentage alloué à l'expérience.
 * @body {number} formationPct    - Pourcentage alloué à la formation.
 * @body {number} historiquePct   - Pourcentage alloué à l'historique d'affectations.
 *
 * @returns {200} La configuration de pondération créée ou mise à jour.
 * @returns {400} Pondérations invalides (ex. somme ≠ 100).
 * @returns {401|403} Non connecté ou rôle insuffisant.
 * @returns {500} Erreur interne du serveur.
 */
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
