/**
 * @module app/api/affectations/[id]/route
 * @description Route API de mise à jour du statut d'une affectation, avec contrôle
 * des transitions autorisées (PROPOSEE → AJUSTEE → FINALISEE) et journalisation.
 */

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireRole, getIp } from "@/lib/permission";


/**
 * Met à jour le statut d'une affectation.
 *
 * Réservé aux RH et administrateurs. Le statut doit être l'une des valeurs
 * autorisées : `PROPOSEE`, `AJUSTEE` ou `FINALISEE`.
 *
 * @route PATCH /api/affectations/[id]
 *
 * @param {Request} request - La requête HTTP avec le corps JSON.
 * @param {{ params: { id: string } }} context - L'identifiant de l'affectation dans l'URL.
 *
 * @body {"PROPOSEE"|"AJUSTEE"|"FINALISEE"} statut - Nouveau statut de l'affectation.
 *
 * @returns {200} L'affectation mise à jour.
 * @returns {400} Corps invalide ou statut manquant/non autorisé.
 * @returns {401|403} Non connecté ou rôle insuffisant.
 * @returns {404} Affectation introuvable.
 * @returns {500} Erreur interne du serveur.
 */

/** Transitions de statut autorisées pour une affectation. */
const TRANSITIONS_VALIDES = {
  PROPOSEE:  ["AJUSTEE"],
  AJUSTEE:   ["FINALISEE"],
  FINALISEE: [],
};

export async function PATCH(request, { params }) {
  const { session, error } = await requireRole("RH", "ADMIN");
  if (error) return error;

  const { id } = await params;
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

    if (!TRANSITIONS_VALIDES[existing.statut]?.includes(statut)) {
      return NextResponse.json(
        {
          success: false,
          message: `Transition invalide : ${existing.statut} → ${statut}.`,
        },
        { status: 400 }
      );
    }

    const updated = await prisma.assignment.update({
      where: { id },
      data:  { statut },
    });

    await prisma.auditLog.create({
      data: {
        action:     "UPDATE",
        entityType: "AFFECTATION",
        entityId:   id,
        userId:     session.user.id,
        metadata: {
          email:    session.user.email,
          role:     session.user.role,
          message:  `Affectation passée de ${existing.statut} à ${statut}`,
          ancienStatut:   existing.statut,
          nouveauStatut:  statut,
        },
        ipAddress: getIp(request),
      },
    });


    return NextResponse.json({ success: true, data: updated });
  } catch (err) {
    console.error("Erreur mise à jour affectation :", err);
    return NextResponse.json(
      { success: false, message: err.message || "Erreur lors de la mise à jour." },
      { status: 500 }
    );
  }
}
