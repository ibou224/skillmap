/**
 * @module app/api/admin/alerts/route
 * @description Route API qui calcule les alertes opérationnelles du tableau de
 * bord administrateur (CV manquants, sessions sans pondération, cours sans
 * compétence, comptes verrouillés, absence de session active).
 */

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireRole } from "@/lib/permission";

/**
 * Détecte les problèmes opérationnels nécessitant l'attention de l'admin.
 *
 * @route GET /api/admin/alerts
 * @access ADMIN
 *
 * @returns {200} { success: true, data: Alert[] }
 *   Alert = { id, severity: "critical"|"warning"|"info", title, count, link }
 */
export async function GET() {
  const { error } = await requireRole("ADMIN");
  if (error) return error;

  try {
    const [
      profsWithoutCv,
      sessionsWithoutWeights,
      coursesWithoutSkills,
      lockedAccounts,
      activeSessions,
    ] = await Promise.all([
      // 1. Professeurs sans CV extrait/validé
      prisma.professor.count({
        where: { cvExtractions: { none: { status: { in: ["EXTRACTED", "VALIDATED"] } } } },
      }),

      // 2. Sessions PLANIFIEE ou ACTIVE sans pondérations
      prisma.session.count({
        where: {
          statut: { in: ["PLANIFIEE", "ACTIVE"] },
          weights: null,
        },
      }),

      // 3. Cours actifs sans compétences requises
      prisma.course.count({
        where: { isArchived: false, courseSkills: { none: {} } },
      }),

      // 4. Comptes verrouillés (lockedUntil dans le futur)
      prisma.user.count({
        where: { lockedUntil: { gt: new Date() } },
      }),

      // 5. Sessions actives (pour info)
      prisma.session.count({ where: { statut: "ACTIVE" } }),
    ]);

    const alerts = [];

    if (profsWithoutCv > 0) {
      alerts.push({
        id: "profs-without-cv",
        severity: "warning",
        title: `${profsWithoutCv} professeur${profsWithoutCv > 1 ? "s n'ont" : " n'a"} pas encore soumis de CV`,
        count: profsWithoutCv,
        link: "/dashboard/admin/cvs",
      });
    }

    if (sessionsWithoutWeights > 0) {
      alerts.push({
        id: "sessions-no-weights",
        severity: "critical",
        title: `${sessionsWithoutWeights} session${sessionsWithoutWeights > 1 ? "s ont" : " a"} aucune pondération configurée`,
        count: sessionsWithoutWeights,
        link: "/dashboard/admin/weights",
      });
    }

    if (coursesWithoutSkills > 0) {
      alerts.push({
        id: "courses-no-skills",
        severity: "warning",
        title: `${coursesWithoutSkills} cours sans compétence requise`,
        count: coursesWithoutSkills,
        link: "/dashboard/admin/courses",
      });
    }

    if (lockedAccounts > 0) {
      alerts.push({
        id: "locked-accounts",
        severity: "critical",
        title: `${lockedAccounts} compte${lockedAccounts > 1 ? "s" : ""} verrouillé${lockedAccounts > 1 ? "s" : ""}`,
        count: lockedAccounts,
        link: "/dashboard/admin/users",
      });
    }

    if (activeSessions === 0) {
      alerts.push({
        id: "no-active-session",
        severity: "info",
        title: "Aucune session académique active",
        count: 0,
        link: "/dashboard/admin/sessions",
      });
    }

    return NextResponse.json({ success: true, data: alerts });
  } catch (err) {
    console.error("GET /api/admin/alerts :", err);
    return NextResponse.json(
      { success: false, message: "Erreur serveur." },
      { status: 500 }
    );
  }
}
