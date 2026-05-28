import { NextResponse } from "next/server";
import { requireRole } from "@/lib/permission.js";
import { jobStore } from "@/lib/jobStore.js";

/**
 * Retourne l'état courant d'un job d'analyse.
 *
 * Appelé en polling par le client toutes les 2 secondes après avoir
 * lancé POST /api/affectations/analyze.
 *
 * @route GET /api/affectations/analyze/status?jobId=xxx
 * @returns {AnalysisJob} L'état du job (status, step, stepIndex, stepTotal, data?, error?)
 */
export async function GET(request) {
  const { error } = await requireRole("RH", "ADMIN");
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const jobId = searchParams.get("jobId");

  if (!jobId) {
    return NextResponse.json(
      { success: false, message: "Paramètre jobId manquant." },
      { status: 400 }
    );
  }

  const job = jobStore.get(jobId);

  if (!job) {
    return NextResponse.json(
      { success: false, message: "Job introuvable ou expiré (30 min max)." },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success:     true,
    id:          job.id,
    status:      job.status,
    step:        job.step,
    stepIndex:   job.stepIndex,
    stepTotal:   job.stepTotal,
    data:        job.status === "DONE"  ? job.data  : undefined,
    error:       job.status === "ERROR" ? job.error : undefined,
    createdAt:   job.createdAt,
    completedAt: job.completedAt,
  });
}
