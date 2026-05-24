import { NextResponse } from "next/server";
import prisma from "@/lib/prisma.js";

/**
 * @module api/sessions/[id]
 * @description Route de gestion détaillée d'une session scolaire
 * Permet de récupérer, mettre à jour et supprimer une session spécifique
 */

/**
 * GET /api/sessions/:id
 * @route GET /api/sessions/:id
 * @description Récupère les infos détaillées d'une session par son ID avec compteurs
 * 
 * @param {Object} params - Paramètres de route
 * @param {string} params.id - ID unique de la session
 * 
 * @returns {Promise<NextResponse>} 200 + { success: true, data: Session }
 * @returns {Promise<NextResponse>} 404 + { success: false, message } si non trouvée
 * @returns {Promise<NextResponse>} 500 + { success: false, message } en cas d'erreur
 * 
 * @example
 * const res = await fetch('/api/sessions/sess-123');
 * const { data: session } = await res.json();
 * // Contient: id, nom, dateDebut, dateFin, _count: { groupes, affectations }
 */
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const session = await prisma.session.findUnique({
      where: { id },
      include: {
        _count: { select: { assignments: true } },
      },
    });

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Session introuvable." },
        { status: 404 },
      );
    }

    const sessionMapped = {
      ...session,
      _count: { affectations: session._count.assignments, groupes: 0 },
    };

    return NextResponse.json({ success: true, data: sessionMapped }, { status: 200 });
  } catch (error) {
    console.error("Erreur GET /api/sessions/[id]:", error);
    return NextResponse.json(
      { success: false, message: "Erreur serveur." },
      { status: 500 },
    );
  }
}

/**
 * PUT /api/sessions/:id
 * @route PUT /api/sessions/:id
 * @description Met à jour les informations d'une session existante
 * 
 * @param {Object} params - Paramètres de route
 * @param {string} params.id - ID de la session
 * @param {Object} request.body - Champs à mettre à jour (tous optionnels)
 * @param {string} [request.body.nom] - Nouveau nom de la session
 * @param {string} [request.body.dateDebut] - Nouvelle date de début (format ISO)
 * @param {string} [request.body.dateFin] - Nouvelle date de fin (format ISO)
 * 
 * @returns {Promise<NextResponse>} 200 + { success: true, data: Session }
 * @returns {Promise<NextResponse>} 404 + { success: false, message } si non trouvée
 * @returns {Promise<NextResponse>} 400 + { success: false, message } si validation échoue
 * @returns {Promise<NextResponse>} 500 + { success: false, message } en cas d'erreur
 * 
 * @example
 * const res = await fetch('/api/sessions/sess-123', {
 *   method: 'PUT',
 *   body: JSON.stringify({ 
 *     nom: 'Session 2024-2025',
 *     dateDebut: '2024-09-01'
 *   })
 * });
 */
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { nom, dateDebut, dateFin } = body;

    // Vérifier que la session existe
    const existing = await prisma.session.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Session introuvable." },
        { status: 404 },
      );
    }

    // Validation du nom
    if (nom !== undefined && (typeof nom !== "string" || nom.trim() === "")) {
      return NextResponse.json(
        {
          success: false,
          message: "Le nom de la session ne peut pas être vide.",
        },
        { status: 400 },
      );
    }

    // Vérification d'unicité si le nom change
    if (nom && nom.trim() !== existing.nom) {
      const duplicate = await prisma.session.findUnique({
        where: { nom: nom.trim() },
      });
      if (duplicate) {
        return NextResponse.json(
          {
            success: false,
            message: `La session "${nom.trim()}" existe déjà.`,
          },
          { status: 409 },
        );
      }
    }

    // Validation dates
    const newDebut = dateDebut ? new Date(dateDebut) : existing.dateDebut;
    const newFin = dateFin ? new Date(dateFin) : existing.dateFin;
    if (newDebut && newFin && newFin < newDebut) {
      return NextResponse.json(
        {
          success: false,
          message: "La date de fin doit être après la date de début.",
        },
        { status: 400 },
      );
    }

    const session = await prisma.session.update({
      where: { id },
      data: {
        ...(nom !== undefined && { nom: nom.trim() }),
        ...(dateDebut !== undefined && { dateDebut: dateDebut ? new Date(dateDebut) : null }),
        ...(dateFin !== undefined && { dateFin: dateFin ? new Date(dateFin) : null }),
      },
      include: {
        _count: { select: { assignments: true } },
      },
    });

    const sessionMapped = {
      ...session,
      _count: { affectations: session._count.assignments, groupes: 0 },
    };

    return NextResponse.json(
      {
        success: true,
        data: sessionMapped,
        message: `Session "${session.nom}" modifiée avec succès.`,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Erreur PUT /api/sessions/[id]:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Erreur lors de la modification de la session.",
      },
      { status: 500 },
    );
  }
}

/**
 * Supprime définitivement une session scolaire.
 *
 * La suppression est refusée si la session a des affectations liées.
 * Si aucune affectation n'est présente, les groupes de la session sont
 * supprimés en premier, puis la session elle-même, le tout en transaction.
 *
 * @route DELETE /api/sessions/[id]
 * @param {Request} request - La requête HTTP entrante.
 * @param {{ params: { id: string } }} context - Paramètres de route contenant l'identifiant.
 * @returns {NextResponse} 200 - Session supprimée avec succès.
 * @returns {NextResponse} 404 - Session introuvable.
 * @returns {NextResponse} 409 - Suppression impossible : affectations liées existantes.
 * @returns {NextResponse} 500 - Erreur interne du serveur.
 */
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;

    const session = await prisma.session.findUnique({
      where: { id },
      include: {
        _count: { select: { assignments: true } },
      },
    });

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Session introuvable." },
        { status: 404 },
      );
    }

    // Empêcher la suppression si des affectations sont liées
    if (session._count.assignments > 0) {
      return NextResponse.json(
        {
          success: false,
          message: `Impossible de supprimer : ${session._count.assignments} affectation(s) liée(s) à cette session.`,
        },
        { status: 409 },
      );
    }

    // Supprimer la configuration de pondération puis la session
    await prisma.$transaction([
      prisma.weightsConfig.deleteMany({ where: { sessionId: id } }),
      prisma.session.delete({ where: { id } }),
    ]);

    return NextResponse.json(
      {
        success: true,
        message: `Session "${session.nom}" supprimée avec succès.`,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Erreur DELETE /api/sessions/[id]:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Erreur lors de la suppression de la session.",
      },
      { status: 500 },
    );
  }
}
