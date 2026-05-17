/**
 * @module api/admin/users/[id]
 * @description Routes API pour la gestion d'un utilisateur spécifique (par son identifiant).
 * Permet de modifier le rôle et le statut d'un utilisateur.
 *
 * Accessible uniquement aux administrateurs (middleware → token valide + rôle ADMIN).
 * Le `passwordHash` est systématiquement exclu de toutes les réponses HTTP.
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma.js";
import { isValidRole } from "@/lib/validation.js";
import { requireRole } from "@/lib/permission.js";

/**
 * Gère la route PUT /api/admin/users/[id] — met à jour le rôle et le statut d'activation d'un utilisateur.
 *
 * Principe du moindre privilège : seuls les champs `estActif` et `role` sont
 * acceptés — toute autre donnée envoyée par le client est ignorée.
 *
 * Lorsque le compte est réactivé (`estActif: true`), le compteur de tentatives
 * de connexion échouées est automatiquement remis à zéro pour éviter un
 * re-verrouillage immédiat sur la prochaine tentative.
 *
 * @param {Request} request - La requête HTTP entrante.
 * @param {{ params: { id: string } }} context - Paramètres de route Next.js contenant l'identifiant.
 * @param {boolean} request.body.estActif - Nouveau statut du compte.
 * @param {string} request.body.role - Nouveau rôle ("ADMIN" ou "RESPONSABLE").
 * @returns {Promise<NextResponse>} Réponse JSON avec l'utilisateur mis à jour ou un message d'erreur.
 * @throws {Error} Si l'utilisateur est introuvable (404), les données sont invalides (400) ou une erreur serveur survient (500).
 */
export async function PUT(request, { params }) {
    const { error } = await requireRole("ADMIN");
    if (error) return error;
  try {
    // Étape 1 : Extraction et validation de l'identifiant
    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { success: false, message: "L'identifiant de l'utilisateur est requis." },
        { status: 400 }
      );
    }

    // Étape 2 : Extraction du payload
    const body = await request.json();
    const { estActif, role } = body;

    // Étape 3 : Validation des champs obligatoires et du rôle
    if (estActif === undefined || role === undefined) {
      return NextResponse.json(
        { success: false, message: "Les champs 'estActif' et 'role' sont obligatoires pour la mise à jour." },
        { status: 400 }
      );
    }
    if (!isValidRole(role)) {
      return NextResponse.json(
        { success: false, message: "Rôle invalide. Les rôles autorisés sont : ADMIN, RESPONSABLE." },
        { status: 400 }
      );
    }

    // Étape 4 : Vérification de l'existence de l'utilisateur
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Utilisateur introuvable." },
        { status: 404 }
      );
    }

    // Étape 5 : Mise à jour ciblée
    // Si le compte est réactivé, on remet le compteur d'échecs à zéro
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        estActif: Boolean(estActif),
        role: String(role).toUpperCase().trim(),
        ...(estActif && { tentativesConnexionEchouees: 0 }),
      },
    });

    // Étape 6 : Sanitisation — le hash du mot de passe est exclu de la réponse
    const { passwordHash, ...safeUpdatedUser } = updatedUser;

    return NextResponse.json({
      success: true,
      message: "Le profil de l'utilisateur a été mis à jour avec succès.",
      user: safeUpdatedUser,
    });

  } catch (error) {
    console.error("Erreur critique PUT /api/admin/users/[id] :", error);
    return NextResponse.json(
      { success: false, message: "Une erreur interne est survenue lors de la mise à jour du profil." },
      { status: 500 }
    );
  }
}

