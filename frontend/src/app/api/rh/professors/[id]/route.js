import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireRole } from "@/lib/permission";
import { normalizeInfosProfessor } from "@/lib/formatData";

/**
 * Retourne le profil CV complet d'un professeur, accessible par le RH/ADMIN.
 *
 * @route   GET /api/rh/professors/[id]
 * @access  RH, ADMIN
 *
 * @param {Request} _request
 * @param {{ params: { id: string } }} context - ID du professeur (Professor.id).
 *
 * @returns {200} { success: true, data: ProfessorCV & { cvStatut, cvFileName } }
 * @returns {401|403} Non authentifié ou rôle insuffisant.
 * @returns {404} Professeur introuvable.
 * @returns {500} Erreur serveur.
 */
export async function GET(_request, { params }) {
  const { error } = await requireRole("RH", "ADMIN");
  if (error) return error;

  const { id } = await params;

  try {
    const professor = await prisma.professor.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, email: true, nom: true, prenom: true, role: true },
        },
        skills: {
          include: { skill: true },
        },
        experiences: {
          orderBy: { dateDebut: "desc" },
        },
        formations: {
          orderBy: { anneeObtention: "desc" },
        },
        cvExtractions: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: {
            id: true,
            status: true,
            fileName: true,
            extractedAt: true,
            validatedAt: true,
            createdAt: true,
          },
        },
      },
    });

    if (!professor) {
      return NextResponse.json(
        { success: false, message: "Professeur introuvable." },
        { status: 404 },
      );
    }

    const base = normalizeInfosProfessor(professor);
    const extraction = professor.cvExtractions[0] ?? null;

    return NextResponse.json({
      success: true,
      data: {
        ...base,
        professorId:   professor.id,
        cvStatut:      extraction?.status   ?? null,
        cvFileName:    extraction?.fileName ?? null,
        cvExtractedAt: extraction?.extractedAt ?? null,
        cvValidatedAt: extraction?.validatedAt ?? null,
      },
    });
  } catch (err) {
    console.error("Erreur GET /api/rh/professors/[id]:", err);
    return NextResponse.json(
      { success: false, message: "Erreur serveur." },
      { status: 500 },
    );
  }
}
