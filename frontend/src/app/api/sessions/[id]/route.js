/**
 * @module app/api/sessions/[id]/route
 * @description Routes API d'une session ciblée par son id : consultation (GET),
 * modification (PUT) et suppression (DELETE).
 */

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma.js";
import { requireRole, getIp } from "@/lib/permission.js";

/**
 * Récupère les infos détaillées d'une session.
 *
 * @route GET /api/sessions/[id]
 * @access ADMIN, RH
 */
export async function GET(request, { params }) {
  const { error } = await requireRole("ADMIN", "RH");
  if (error) return error;

  try {
    const { id } = await params;
    const session = await prisma.session.findUnique({
      where: { id },
      include: { _count: { select: { assignments: true } } },
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
 * Met à jour les informations d'une session.
 *
 * @route PUT /api/sessions/[id]
 * @access ADMIN, RH
 */
export async function PUT(request, { params }) {
  const { session: authSession, error } = await requireRole("ADMIN", "RH");
  if (error) return error;

  try {
    const { id } = await params;
    const body = await request.json();
    const { nom, dateDebut, dateFin } = body;

    const existing = await prisma.session.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Session introuvable." },
        { status: 404 },
      );
    }

    if (nom !== undefined && (typeof nom !== "string" || nom.trim() === "")) {
      return NextResponse.json(
        { success: false, message: "Le nom de la session ne peut pas être vide." },
        { status: 400 },
      );
    }

    if (nom && nom.trim() !== existing.nom) {
      const duplicate = await prisma.session.findUnique({ where: { nom: nom.trim() } });
      if (duplicate) {
        return NextResponse.json(
          { success: false, message: `La session "${nom.trim()}" existe déjà.` },
          { status: 409 },
        );
      }
    }

    const newDebut = dateDebut ? new Date(dateDebut) : existing.dateDebut;
    const newFin = dateFin ? new Date(dateFin) : existing.dateFin;
    if (newDebut && newFin && newFin < newDebut) {
      return NextResponse.json(
        { success: false, message: "La date de fin doit être après la date de début." },
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
      include: { _count: { select: { assignments: true } } },
    });

    await prisma.auditLog.create({
      data: {
        action: "UPDATE",
        entityType: "SESSION",
        entityId: id,
        userId: authSession.user.id,
        metadata: {
          email: authSession.user.email,
          role: authSession.user.role,
          message: "Session modifiée",
          nom: session.nom,
        },
        ipAddress: getIp(request),
      },
    });

    const sessionMapped = {
      ...session,
      _count: { affectations: session._count.assignments, groupes: 0 },
    };

    return NextResponse.json(
      { success: true, data: sessionMapped, message: `Session "${session.nom}" modifiée avec succès.` },
      { status: 200 },
    );
  } catch (error) {
    console.error("Erreur PUT /api/sessions/[id]:", error);
    return NextResponse.json(
      { success: false, message: "Erreur lors de la modification de la session." },
      { status: 500 },
    );
  }
}

/**
 * Supprime définitivement une session scolaire.
 *
 * @route DELETE /api/sessions/[id]
 * @access ADMIN, RH
 */
export async function DELETE(request, { params }) {
  const { session: authSession, error } = await requireRole("ADMIN", "RH");
  if (error) return error;

  try {
    const { id } = await params;

    const session = await prisma.session.findUnique({
      where: { id },
      include: { _count: { select: { assignments: true } } },
    });

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Session introuvable." },
        { status: 404 },
      );
    }

    if (session._count.assignments > 0) {
      return NextResponse.json(
        {
          success: false,
          message: `Impossible de supprimer : ${session._count.assignments} affectation(s) liée(s) à cette session.`,
        },
        { status: 409 },
      );
    }

    await prisma.$transaction([
      prisma.weightsConfig.deleteMany({ where: { sessionId: id } }),
      prisma.session.delete({ where: { id } }),
    ]);

    await prisma.auditLog.create({
      data: {
        action: "DELETE",
        entityType: "SESSION",
        entityId: id,
        userId: authSession.user.id,
        metadata: {
          email: authSession.user.email,
          role: authSession.user.role,
          message: "Session supprimée",
          nom: session.nom,
        },
        ipAddress: getIp(request),
      },
    });

    return NextResponse.json(
      { success: true, message: `Session "${session.nom}" supprimée avec succès.` },
      { status: 200 },
    );
  } catch (error) {
    console.error("Erreur DELETE /api/sessions/[id]:", error);
    return NextResponse.json(
      { success: false, message: "Erreur lors de la suppression de la session." },
      { status: 500 },
    );
  }
}
