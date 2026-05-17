/**
 * @module api/admin/users/[id]
 * @description Routes API pour la gestion d'un utilisateur spécifique (par son identifiant).
 * Permet de desactiver un utilisateur.
 *
 * Accessible uniquement aux administrateurs (middleware → token valide + rôle ADMIN).
 * Le `passwordHash` est systématiquement exclu de toutes les réponses HTTP.
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma.js";
import { requireRole } from "@/lib/permission.js";

/**
 *
 * Contrairement aux affectations qui utilisent un soft delete, les utilisateurs
 * sont supprimés physiquement. Si l'utilisateur possède des enregistrements liés
 * (logs d'audit, affectations créées, etc.), la suppression est refusée avec un
 * message métier explicite (409) plutôt qu'un 500 générique.
 *
 * @param {Request} _request - La requête HTTP entrante (non utilisée).
 * @param {{ params: { id: string } }} context - Paramètres de route Next.js contenant l'identifiant.
 * @returns {Promise<NextResponse>} Réponse JSON confirmant la suppression ou un message d'erreur.
 * @throws {Error} Si des enregistrements liés existent (409), l'utilisateur est introuvable (404) ou une erreur serveur survient (500).
 */
export async function DELETE(_request, { params }) {
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

    // Étape 2 : Vérification de l'existence de l'utilisateur avant suppression
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Utilisateur introuvable." },
        { status: 404 }
      );
    }

    // Étape 3 : Suppression physique
    const userDeleted = await prisma.user.update({ where: { id }, 
        data: { isActive: false } 
    });

    // Étape 4 : Sanitisation — le hash du mot de passe est exclu de la réponse
    const { passwordHash, ...safeUser } = userDeleted;

    return NextResponse.json({
      success: true,
      message: "Utilisateur desactivé avec succès.",
      user: safeUser,
    });

  } catch (error) {
    console.error("Erreur lors de la suppression de l'utilisateur:", error);

    // P2003 : l'utilisateur possède des enregistrements liés (FK constraint)
    if (error.code === "P2003") {
      return NextResponse.json(
        { success: false, message: "Impossible de supprimer cet utilisateur : il possède des enregistrements liés." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Une erreur interne est survenue lors de la suppression." },
      { status: 500 }
    );
  }
}
