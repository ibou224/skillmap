import { NextResponse } from 'next/server';
import prisma from "@/lib/prisma.js";
import { requireRole } from "@/lib/permission.js";

/**
 * Récupère le profil complet du professeur connecté.
 *
 * Réservé aux professeurs. Charge en une requête toutes les données liées :
 * informations personnelles, compétences, expériences, formations et
 * extractions de CV.
 *
 * @route GET /api/users
 *
 * @param {Request} request - La requête HTTP.
 *
 * @returns {200} Le profil complet du professeur connecté.
 * @returns {401|403} Non connecté ou rôle insuffisant.
 * @returns {404} Profil professeur introuvable.
 * @returns {500} Erreur interne du serveur.
 */
export async function GET() {
  const { session, error } = await requireRole("PROFESSEUR");
  if (error) return error;

  try {
    const professor = await prisma.professor.findUnique({
      where: { userId: session.user.id },
      include: {
        user: {
          select: { id: true, email: true, nom: true, prenom: true, role: true, isActive: true },
        },
        skills: {
          include: {
            skill: true,
          },
        },
        experiences: true,
        formations: true,
        cvExtractions: true,
      },
    });

    if (!professor) {
      return NextResponse.json(
        { success: false, message: "Profil professeur introuvable." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: professor,
    });

  } catch (err) {
    console.error("Erreur :", err);
    return NextResponse.json(
      { success: false, message: "Erreur serveur." },
      { status: 500 }
    );
  }
}