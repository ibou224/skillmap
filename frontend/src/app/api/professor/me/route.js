/**
 * @module api/professor/me
 * @description Route de consultation du profil complet du professeur authentifié.
 *
 * Seuls les utilisateurs avec le rôle `PROFESSEUR` peuvent accéder à cette route.
 * Le profil retourné est normalisé via `normalizeInfosProfessor` avant d'être
 * sérialisé, afin d'exposer une structure stable au client indépendamment
 * du schéma interne de la base de données.
 */

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma.js";
import { requireRole } from "@/lib/permission.js";
import { normalizeInfosProfessor } from "@/lib/formatData";

/**
 * Récupère le profil CV complet du professeur connecté.
 *
 * Charge en une seule requête l'ensemble des données liées au professeur :
 * informations personnelles (via `User`), compétences avec leur référentiel
 * `Skill`, expériences professionnelles et formations académiques.
 *
 * @route   GET /api/professor/me
 * @access  PROFESSEUR
 *
 * @param {Request} request - Requête HTTP entrante (non utilisée directement —
 *   l'identité est extraite de la session NextAuth par `requireRole`).
 *
 * @returns {Promise<NextResponse>} 200 + `{ success: true, data: ProfessorCV }` — profil normalisé.
 * @returns {Promise<NextResponse>} 401 — utilisateur non authentifié ou rôle insuffisant.
 * @returns {Promise<NextResponse>} 404 — aucun profil `Professor` lié à cet utilisateur.
 * @returns {Promise<NextResponse>} 500 — erreur serveur inattendue.
 */
export async function GET(request) {
  const { session, error } = await requireRole("PROFESSEUR");
  if (error) return error;

  try {
    const professor = await prisma.professor.findUnique({
      where: { userId: session.user.id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            nom: true,
            prenom: true,
            role: true,
          },
        },
        skills: {
          include: {
            skill: true,
          },
        },
        experiences: true,
        formations: true,
        cvExtractions: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { status: true },
        },
      },
    });

    if (!professor) {
      return NextResponse.json(
        { success: false, message: "Profil professeur introuvable." },
        { status: 404 },
      );
    }
    return NextResponse.json({
      success: true,
      data: normalizeInfosProfessor(professor),
    });
  } catch (err) {
    console.error("Erreur :", err);
    return NextResponse.json(
      { success: false, message: "Erreur serveur." },
      { status: 500 },
    );
  }
}


