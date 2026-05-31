/**
 * @module app/api/affectations/route
 * @description Route API de listing des affectations, avec filtrage selon le rôle
 * (un professeur ne voit que ses affectations finalisées ; RH/ADMIN voient tout).
 */

import { NextResponse } from 'next/server';
import prisma from "@/lib/prisma.js";
import { requireRole } from "@/lib/permission.js";

/**
 * Récupère la liste des affectations selon le rôle de l'utilisateur connecté.
 *
 * - **PROFESSEUR** : retourne uniquement ses propres affectations.
 * - **RH / ADMIN** : retourne toutes les affectations, avec filtre optionnel par professeur.
 *
 * @route GET /api/affectations
 *
 * @param {Request} request - La requête HTTP.
 * @queryParam {string} [professeurId] - (RH/ADMIN uniquement) Filtre par identifiant de professeur.
 *
 * @returns {200} Liste des affectations avec le détail du cours et du professeur.
 * @returns {401|403} Non connecté ou rôle insuffisant.
 * @returns {404} Profil professeur introuvable (pour le rôle PROFESSEUR).
 * @returns {500} Erreur interne du serveur.
 */

export async function GET(request) {
  const { session, error } = await requireRole("PROFESSEUR", "RH","ADMIN");
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const professeurId = searchParams.get('professeurId');
  const sessionId    = searchParams.get('sessionId');

  try {
    if (session.user.role === "PROFESSEUR") {
      return await getProfesseurAffectations(session);
    }

    return await getRHAffectations(professeurId, sessionId);

  } catch (err) {
    console.error("Erreur lors de la récupération des affectations :", err);
    return NextResponse.json({
      success: false,
      message: "Erreur lors de la récupération des affectations.",
    }, { status: 500 });
  }
}

/**
 * Récupère les affectations FINALISEE du professeur connecté.
 * @param {import('next-auth').Session} session - Session de l'utilisateur connecté.
 * @returns {Promise<NextResponse>} 200 avec les affectations, 404 si profil introuvable.
 */
async function getProfesseurAffectations(session) {
  const professor = await prisma.professor.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });

  if (!professor) {
    return NextResponse.json(
      { success: false, message: "Profil professeur introuvable." },
      { status: 404 }
    );
  }

  const affectations = await prisma.assignment.findMany({
    where: { professorId: professor.id, statut:"FINALISEE" },
    include: { 
      course: { 
        select: { 
          id: true, 
          code: true, 
          nom: true, 
          etape: true, 
          programs: { 
            select: { 
              id: true, 
              code: true, 
              nom: true 
            } 
          } 
        } 
      }, 
      professor: { 
          select: { 
            id: true, 
            user: { 
              select: { 
                nom: true, 
                prenom: true, 
                email: true 
              } 
            },
            skills: { 
              select: { 
                skill: { 
                  select: { 
                    nom: true 
                  }
                } 
              } 
            },
          } 
      }, 
      session: { 
        select: { id: true, nom: true, statut: true  } } },
    orderBy: [{ course: { code: 'asc' } }],
  });

  return NextResponse.json({
    success: true,
    data: flattenAssignments(affectations),
  });
}

/**
 * Récupère les affectations pour RH/ADMIN, avec filtres optionnels.
 * @param {string|null} professeurId - Filtre par professeur (optionnel).
 * @param {string|null} sessionId - Filtre par session (optionnel).
 * @returns {Promise<NextResponse>} 200 avec les affectations.
 */
async function getRHAffectations(professeurId, sessionId) {
  const affectations = await prisma.assignment.findMany({
    where: {
      ...(professeurId ? { professorId: professeurId } : {}),
      ...(sessionId    ? { sessionId }                 : {}),
    },
    include: { 
      course: { 
        select: { 
          id: true, 
          code: true, 
          nom: true, 
          etape: true, 
          programs: { 
            select: { 
              id: true, 
              code: true, 
              nom: true 
            } 
          } 
        } 
      }, 
      professor: { 
          select: { 
            id: true, 
            user: { 
              select: { 
                nom: true, 
                prenom: true, 
                email: true 
              } 
            },
            skills: { 
              select: { 
                skill: { 
                  select: { 
                    nom: true 
                  }
                } 
              } 
            },
          } 
      }, 
      session: { 
        select: { id: true, nom: true, statut: true  } } },
    orderBy: [{ course: { code: 'asc' } }],
  });

  return NextResponse.json({
    success: true,
    data: flattenAssignments(affectations),
  });
}

/**
 * Aplatit les affectations Prisma en objets plats prêts pour l'UI.
 * @param {Array<Object>} assignments - Affectations issues de Prisma (avec relations).
 * @returns {Array<Object>} Affectations normalisées (cours, professeur, scores, statut...).
 */
function flattenAssignments(assignments) {
  return assignments.map((a) => ({
    id:            a.id,
    sessionId:     a.sessionId,
    sessionNom:    a.session?.nom    ?? null,
    sessionStatut: a.session?.statut ?? null,
    statut:        a.statut,
    score:         a.score,
    scoreDetail:   a.scoreDetail,
    notes:         a.notes ?? null,
    cours: {
      id:         a.course.id,
      code:       a.course.code,
      nom:        a.course.nom,
      etape:      a.course.etape,
      programmes: a.course.programs ?? [],
    },
    professeur: {
      id:          a.professor.id,
      prenom:      a.professor.user.prenom,
      nom:         a.professor.user.nom,
      email:       a.professor.user.email,
      competences: a.professor.skills.map((s) => s.skill.nom),
    },
  }));
}
