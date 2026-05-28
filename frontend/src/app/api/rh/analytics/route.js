import { NextResponse } from "next/server";
import prisma from "@/lib/prisma.js";
import { requireRole } from "@/lib/permission.js";

/**
 * Retourne les données analytiques des affectations pour le tableau de bord RH.
 *
 * @route GET /api/rh/analytics
 *
 * @returns {Object} sessionsStats, scoreDistribution, topProfessors, globalStats
 */
export async function GET() {
  const { error } = await requireRole("RH", "ADMIN");
  if (error) return error;

  try {
    // ── 1. 5 dernières sessions avec leurs affectations ──────────────────────
    const sessions = await prisma.session.findMany({
      orderBy: [{ annee: "desc" }, { createdAt: "desc" }],
      take: 5,
      include: {
        assignments: { select: { statut: true, score: true } },
      },
    });

    const sessionsStats = sessions
      .map((s) => {
        const proposee  = s.assignments.filter((a) => a.statut === "PROPOSEE").length;
        const ajustee   = s.assignments.filter((a) => a.statut === "AJUSTEE").length;
        const finalisee = s.assignments.filter((a) => a.statut === "FINALISEE").length;
        const total     = s.assignments.length;
        return {
          nom:               `${s.nom}`,
          periode:           `${s.periode} ${s.annee}`,
          proposee,
          ajustee,
          finalisee,
          total,
          tauxFinalisation:  total > 0 ? Math.round((finalisee / total) * 100) : 0,
        };
      })
      .reverse();

    const allScores = sessions.flatMap((s) => s.assignments.map((a) => a.score));

    const scoreDistribution = [
      { range: "< 25",  count: 0, color: "#ef4444" },
      { range: "25–50", count: 0, color: "#f97316" },
      { range: "50–75", count: 0, color: "#eab308" },
      { range: "75–90", count: 0, color: "#22c55e" },
      { range: "≥ 90",  count: 0, color: "#10b981" },
    ];
    allScores.forEach((score) => {
      if      (score < 25) scoreDistribution[0].count++;
      else if (score < 50) scoreDistribution[1].count++;
      else if (score < 75) scoreDistribution[2].count++;
      else if (score < 90) scoreDistribution[3].count++;
      else                 scoreDistribution[4].count++;
    });

    const finalizedAssignments = await prisma.assignment.findMany({
      where:   { statut: "FINALISEE" },
      select: {
        professorId: true,
        professor: {
          select: { user: { select: { nom: true, prenom: true } } },
        },
      },
    });

    const profMap = new Map();
    finalizedAssignments.forEach((a) => {
      const key = a.professorId;
      if (!profMap.has(key)) {
        profMap.set(key, {
          nom:   `${a.professor.user.prenom} ${a.professor.user.nom}`,
          count: 0,
        });
      }
      profMap.get(key).count++;
    });

    const topProfessors = Array.from(profMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // ── 4. Stats globales ─────────────────────────────────────────────────────
    const totalAssignments = allScores.length;
    const finalizedCount   = sessions.reduce(
      (s, sess) => s + sess.assignments.filter((a) => a.statut === "FINALISEE").length,
      0
    );
    const avgScore = totalAssignments > 0
      ? Math.round((allScores.reduce((s, v) => s + v, 0) / totalAssignments) * 10) / 10
      : 0;

    const globalStats = {
      totalSessions:    sessions.length,
      totalAssignments,
      finalizedRate:    totalAssignments > 0 ? Math.round((finalizedCount / totalAssignments) * 100) : 0,
      avgScore,
    };

    return NextResponse.json({
      success: true,
      data: { sessionsStats, scoreDistribution, topProfessors, globalStats },
    });

  } catch (err) {
    console.error("[analytics] Erreur :", err);
    return NextResponse.json(
      { success: false, message: err.message || "Erreur interne." },
      { status: 500 }
    );
  }
}
