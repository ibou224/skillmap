import { NextResponse } from "next/server";
import prisma from "@/lib/prisma.js";
import { isValidRole } from "@/lib/validation.js";
import { requireRole } from "@/lib/permission.js";

/**
 * Modifie le rôle et le statut d'un utilisateur.
 *
 * Réservé aux administrateurs. Si l'utilisateur est réactivé (`estActif: true`),
 * le compteur de tentatives de connexion est remis à zéro.
 *
 * @route PUT /api/admin/users/[id]
 *
 * @param {Request} request - La requête HTTP avec le corps JSON.
 * @param {{ params: { id: string } }} context - L'identifiant de l'utilisateur dans l'URL.
 *
 * @body {boolean} estActif - `true` pour activer le compte, `false` pour le désactiver.
 * @body {string}  role     - Nouveau rôle : `ADMIN`, `RH` ou `PROFESSEUR`.
 *
 * @returns {200} L'utilisateur mis à jour (sans le mot de passe).
 * @returns {400} Identifiant manquant, champs absents ou rôle invalide.
 * @returns {401|403} Non connecté ou non administrateur.
 * @returns {404} Utilisateur introuvable.
 * @returns {500} Erreur interne du serveur.
 */
export async function PUT(request, { params }) {
  const { error } = await requireRole("ADMIN");
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
 * Réservé aux administrateurs. Contrairement à la désactivation, cette opération
 * est irréversible. La suppression est bloquée si l'utilisateur possède des
 * enregistrements liés (contrainte de clé étrangère Prisma P2003).
 *
 * @route DELETE /api/admin/users/[id]
 *
 * @param {Request} request - La requête HTTP.
 * @param {{ params: { id: string } }} context - L'identifiant de l'utilisateur dans l'URL.
 *
 * @returns {200} Confirmation de suppression avec le nom de l'utilisateur.
 * @returns {400} Identifiant manquant.
 * @returns {401|403} Non connecté ou non administrateur.
 * @returns {404} Utilisateur introuvable.
 * @returns {500} Erreur interne du serveur.
 */
export async function DELETE(request, { params }) {
  const { error } = await requireRole("ADMIN");
  if (error) return error;

  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { success: false, message: "L'identifiant de l'utilisateur est requis." },
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

    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: `Le compte de ${user.prenom} ${user.nom} a été désactivé.`,
    });

  } catch (err) {
    console.error("Erreur critique DELETE /api/admin/users/[id] :", err);
    return NextResponse.json(
      { success: false, message: "Une erreur interne est survenue." },
      { status: 500 }
    );
  }
}
