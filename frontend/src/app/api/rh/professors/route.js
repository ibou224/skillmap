/**
 * @module app/api/rh/professors/route
 * @description Route API listant les professeurs avec leur statut de CV le plus
 * récent, pour les tableaux de bord RH/ADMIN.
 */

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireRole } from "@/lib/permission";

/**
 * Liste tous les professeurs avec leur statut de CV le plus récent.
 *
 * @route GET /api/rh/professors
 * @access RH, ADMIN
 *
 * @returns {200} { success: true, data: Professor[] }
 * @returns {401|403} Non authentifié ou rôle insuffisant.
 * @returns {500} Erreur serveur.
 */
export async function GET() {
  const { error } = await requireRole("RH", "ADMIN");
  if (error) return error;

  try {
    const professors = await prisma.professor.findMany({
      include: {
        user: {
          select: { id: true, nom: true, prenom: true, email: true, isActive: true },
        },
        cvExtractions: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { id: true, status: true, fileName: true, extractedAt: true, validatedAt: true, createdAt: true },
        },
        _count: {
          select: { skills: true, experiences: true, formations: true },
        },
      },
      orderBy: { user: { nom: "asc" } },
    });

    const data = professors.map((p) => ({
      id: p.id,
      userId: p.user.id,
      nom: p.user.nom,
      prenom: p.user.prenom,
      email: p.email || p.user.email,
      titre: p.titre ?? null,
      github: p.github ?? null,
      isActive: p.user.isActive,
      cvStatut: p.cvExtractions[0]?.status ?? null,
      cvId: p.cvExtractions[0]?.id ?? null,
      cvFileName: p.cvExtractions[0]?.fileName ?? null,
      cvExtractedAt: p.cvExtractions[0]?.extractedAt ?? null,
      cvValidatedAt: p.cvExtractions[0]?.validatedAt ?? null,
      cvCreatedAt: p.cvExtractions[0]?.createdAt ?? null,
      competences: p._count.skills,
      experiences: p._count.experiences,
      formations: p._count.formations,
    }));

    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (err) {
    console.error("Erreur GET /api/rh/professors:", err);
    return NextResponse.json(
      { success: false, message: "Erreur serveur." },
      { status: 500 }
    );
  }
}