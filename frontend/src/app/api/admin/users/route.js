/**
 * @module api/admin/users
 * @description Route API pour la liste paginée des utilisateurs du système.
 *
 * Accessible uniquement aux administrateurs (middleware → token valide + rôle ADMIN).
 * Applique une sélection stricte des champs pour ne jamais exposer de données sensibles
 * (mot de passe, refresh token, etc.).
 */

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma.js";
import { requireRole } from "@/lib/permission.js";

/**
 * Gère la route GET /api/admin/users — récupère la liste paginée des utilisateurs, triée alphabétiquement par nom.
 *
 * Les paramètres de pagination sont validés et bornés côté serveur :
 * - `page` est forcé à un minimum de 1.
 * - `limit` est contraint entre 1 et 100 (défaut : 12).
 *
 * @param {Request} request - La requête HTTP entrante.
 * @param {string} [request.searchParams.page] - Numéro de page (défaut : 1, min : 1).
 * @param {string} [request.searchParams.limit] - Nombre d'utilisateurs par page (défaut : 10, plage : 1–100).
 * @returns {Promise<NextResponse>} Réponse JSON avec la liste des utilisateurs et les métadonnées de pagination, ou un message d'erreur.
 * @throws {Error} Si une erreur serveur survient.
 */
export async function GET(request) {
    const {error} = await requireRole("ADMIN")
    if(error) return error;

  try {
    const { searchParams } = new URL(request.url);
    const showArchived = searchParams.get("archived") === "true";

    const users = await prisma.user.findMany({
      where: { isArchived: showArchived },
      select: {
        id: true, email: true, nom: true, prenom: true, role: true,
        isActive: true, isArchived: true, loginAttempts: true, lockedUntil: true,
        professor: {
          select: {
            cvExtractions: {
              where: { status: { in: ["EXTRACTED", "VALIDATED"] } },
              take: 1,
              select: { id: true },
            },
          },
        },
      },
      orderBy: { prenom: "asc" },
    });

    const data = users.map((u) => ({
      ...u,
      cvUploaded: (u.professor?.cvExtractions?.length ?? 0) > 0,
      professor: undefined,
    }));

    return NextResponse.json({ success: true, data });

  } catch (error) {
    console.error("Erreur critique GET /api/admin/users :", error);
    return NextResponse.json(
      { success: false, message: "Une erreur est survenue lors de la récupération des utilisateurs." },
      { status: 500 }
    );
  }
}
