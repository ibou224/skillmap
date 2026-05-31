/**
 * @module app/api/admin/users/[id]/unlock/route
 * @description Route API permettant à un administrateur de déverrouiller
 * manuellement un compte bloqué après trop de tentatives de connexion.
 */

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma.js";
import { requireRole, getIp } from "@/lib/permission.js";

/**
 * Déverrouille manuellement un compte utilisateur bloqué.
 *
 * Un compte est verrouillé après 5 tentatives de connexion échouées.
 * Il se déverrouille automatiquement après 30 minutes.
 * Cet endpoint permet à un administrateur de le déverrouiller immédiatement.
 *
 * @route  PUT /api/admin/users/[id]/unlock
 * @access ADMIN
 *
 * @returns {200} Compte déverrouillé avec succès.
 * @returns {401|403} Non authentifié ou rôle insuffisant.
 * @returns {404} Utilisateur introuvable.
 * @returns {409} Le compte n'est pas verrouillé.
 */
export async function PUT(request, { params }) {
  const { session, error } = await requireRole("ADMIN");
  if (error) return error;

  const { id } = await params;

  const user = await prisma.user.findUnique({
    where:  { id },
    select: { id: true, email: true, loginAttempts: true, lockedUntil: true, isActive: true },
  });

  if (!user) {
    return NextResponse.json(
      { success: false, message: "Utilisateur introuvable." },
      { status: 404 }
    );
  }

  const isLocked = user.lockedUntil && user.lockedUntil > new Date();
  if (!isLocked && user.loginAttempts === 0) {
    return NextResponse.json(
      { success: false, message: "Ce compte n'est pas verrouillé." },
      { status: 409 }
    );
  }

  await prisma.user.update({
    where: { id },
    data:  { loginAttempts: 0, lockedUntil: null },
  });

  await prisma.auditLog.create({
    data: {
      action:     "UPDATE",
      entityType: "USER",
      entityId:   id,
      userId:     session.user.id,
      metadata:   {
        email:       session.user.email,
        role:        session.user.role,
        message:     "Compte utilisateur déverrouillé manuellement par un administrateur",
        targetEmail: user.email,
        attempts:    user.loginAttempts,
      },
      ipAddress: getIp(request),
    },
  });

  return NextResponse.json({
    success: true,
    message: `Compte de ${user.email} déverrouillé avec succès.`,
  });
}
