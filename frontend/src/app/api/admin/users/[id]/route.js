/**
 * @module app/api/admin/users/[id]/route
 * @description Routes API d'administration d'un utilisateur ciblé par son id :
 * modification du rôle/statut (PUT) et archivage (DELETE). Toutes les actions
 * sont journalisées dans les logs d'audit.
 */

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma.js";
import { isValidRole } from "@/lib/validation.js";
import { requireRole, getIp } from "@/lib/permission.js";

/**
 * Modifie le rôle et le statut d'un utilisateur.
 *
 * @route PUT /api/admin/users/[id]
 * @access ADMIN
 */
export async function PUT(request, { params }) {
  const { session, error } = await requireRole("ADMIN");
  if (error) return error;

  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { success: false, message: "L'identifiant de l'utilisateur est requis." },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { estActif, role } = body;

    if (estActif === undefined || role === undefined) {
      return NextResponse.json(
        { success: false, message: "Les champs 'estActif' et 'role' sont obligatoires." },
        { status: 400 }
      );
    }

    if (!isValidRole(role)) {
      return NextResponse.json(
        { success: false, message: "Rôle invalide. Les rôles autorisés sont : ADMIN, RH, PROFESSEUR." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Utilisateur introuvable." },
        { status: 404 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        isActive: Boolean(estActif),
        role: String(role).toUpperCase().trim(),
        ...(estActif && { loginAttempts: 0 }),
      },
      select: { id: true, email: true, nom: true, prenom: true, role: true, isActive: true },
    });

    await prisma.auditLog.create({
      data: {
        action: "UPDATE",
        entityType: "USER",
        entityId: id,
        userId: session.user.id,
        metadata: {
          email: session.user.email,
          role: session.user.role,
          message: "Profil utilisateur mis à jour",
          cible: user.email,
          nouveauRole: updatedUser.role,
          estActif: updatedUser.isActive,
        },
        ipAddress: getIp(request),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Le profil de l'utilisateur a été mis à jour avec succès.",
      user: updatedUser,
    });

  } catch (err) {
    console.error("Erreur critique PUT /api/admin/users/[id] :", err);
    return NextResponse.json(
      { success: false, message: "Une erreur interne est survenue lors de la mise à jour." },
      { status: 500 }
    );
  }
}

/**
 * Supprime définitivement un utilisateur.
 *
 * @route DELETE /api/admin/users/[id]
 * @access ADMIN
 */
export async function DELETE(request, { params }) {
  const { session, error } = await requireRole("ADMIN");
  if (error) return error;

  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { success: false, message: "L'identifiant de l'utilisateur est requis." },
        { status: 400 }
      );
    }

    if (id === session.user.id) {
      return NextResponse.json(
        { success: false, message: "Vous ne pouvez pas archiver votre propre compte." },
        { status: 403 }
      );
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Utilisateur introuvable." },
        { status: 404 }
      );
    }

    await prisma.user.update({
      where: { id },
      data: { isArchived: true, isActive: false, loginAttempts: 0, lockedUntil: null },
    });

    await prisma.auditLog.create({
      data: {
        action: "ARCHIVE",
        entityType: "USER",
        entityId: id,
        userId: session.user.id,
        metadata: {
          email: session.user.email,
          role: session.user.role,
          message: "Compte utilisateur archivé",
          cible: user.email,
        },
        ipAddress: getIp(request),
      },
    });

    return NextResponse.json({
      success: true,
      message: `Le compte de ${user.prenom} ${user.nom} a été archivé.`,
    });

  } catch (err) {
    console.error("Erreur critique DELETE /api/admin/users/[id] :", err);
    return NextResponse.json(
      { success: false, message: "Une erreur interne est survenue." },
      { status: 500 }
    );
  }
}
