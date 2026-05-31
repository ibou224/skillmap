import { NextResponse } from "next/server";
import { isValidPassword, isValidString } from "@/lib/validation.js";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma.js";
import { auth } from "@/lib/auth.js";
import { getIp } from "@/lib/permission.js";
import { requireRole } from "@/lib/permission.js";

/**
 * @module app/api/settings/route
 * @description Routes API des paramètres du compte connecté : mise à jour du
 * profil (PATCH) et changement de mot de passe (PUT).
 */

/**
 * Met à jour les informations de profil (prénom, nom) du compte connecté.
 * @route PATCH /api/settings
 * @access ADMIN, RH, PROFESSEUR
 * @param {Request} request - Corps JSON avec les champs de profil.
 * @returns {NextResponse} 200 si succès, 400 si invalide, 401/403 si non autorisé, 500 sur erreur.
 */
export async function PATCH(request) {
  const { session, error } = await requireRole("ADMIN", "RH", "PROFESSEUR");
  if (error) return error;

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Utilisateur introuvable." },
        { status: 404 },
      );
    }

    const body = await request.json();
    const { password, newpassword } = body;

    const passwordValidation = isValidPassword(password);
    const newPasswordValidation = isValidPassword(newpassword);
    if (!passwordValidation.valid || !newPasswordValidation.valid) {
      return NextResponse.json(
        {
          success: false,
          message: passwordValidation.message || newPasswordValidation.message,
        },
        { status: 400 },
      );
    }

    const passwordOk = await bcrypt.compare(password, user.passwordHash);
    if (!passwordOk) {
      return NextResponse.json(
        { success: false, message: "Mot de passe incorrect." },
        { status: 400 },
      );
    }

    const newPasswordHash = await bcrypt.hash(newpassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: newPasswordHash },
    });

    await prisma.auditLog.create({
      data: {
        action: "UPDATE",
        entityType: "USER",
        entityId: user.id,
        userId: user.id,
        metadata: { field: "password" },
        ipAddress: getIp(request),
      },
    });

    return NextResponse.json(
      { success: true, message: "Mot de passe modifié avec succès." },
      { status: 200 },
    );
  } catch (err) {
    console.error("Erreur lors de la modification du mot de passe :", err);
    return NextResponse.json(
      {
        success: false,
        message: "Erreur lors de la modification du mot de passe.",
      },
      { status: 500 },
    );
  }
}

/**
 * Change le mot de passe du compte connecté (vérifie l'ancien, valide le nouveau).
 * @route PUT /api/settings
 * @access ADMIN, RH, PROFESSEUR
 * @param {Request} request - Corps JSON `{ password, newpassword }`.
 * @returns {NextResponse} 200 si succès, 400 si invalide, 401/403 si non autorisé, 500 sur erreur.
 */
export async function PUT(request) {
  const { session, error } = await requireRole("ADMIN", "RH", "PROFESSEUR");
  if (error) return error;

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Utilisateur introuvable." },
        { status: 404 },
      );
    }

    const body = await request.json();
    const { prenom, nom } = body;

    const prenomValidation = isValidString(prenom);
    const nomValidation = isValidString(nom);
    if (!prenomValidation.valid || !nomValidation.valid) {
      return NextResponse.json(
        {
          success: false,
          message: prenomValidation.message || nomValidation.message,
        },
        { status: 400 },
      );
    }

    await prisma.user.update({ where: { id: user.id }, data: { prenom, nom } });

    await prisma.auditLog.create({
      data: {
        action: "UPDATE",
        entityType: "USER",
        entityId: user.id,
        userId: user.id,
        metadata: { fields: ["prenom", "nom"] },
        ipAddress: getIp(request),
      },
    });

    return NextResponse.json(
      { success: true, message: "Profil mis à jour avec succès." },
      { status: 200 },
    );
  } catch (err) {
    console.error("Erreur lors de la modification du profil :", err);
    return NextResponse.json(
      { success: false, message: "Erreur lors de la modification du profil." },
      { status: 500 },
    );
  }
}
