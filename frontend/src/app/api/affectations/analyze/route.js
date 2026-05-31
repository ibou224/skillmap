import { NextResponse }        from "next/server";
import { randomUUID }          from "crypto";
import prisma                  from "@/lib/prisma.js";
import { requireRole, getIp }  from "@/lib/permission.js";
import { createJob, updateJob } from "@/lib/jobStore.js";
import { checkRateLimit, rateLimitResponse } from "@/lib/rateLimit.js";

/**
 * @module app/api/affectations/analyze/route
 * @description Route API d'analyse automatique des affectations. Crée un job
 * asynchrone, appelle le backend FastAPI pour calculer les scores, filtre/persiste
 * les propositions et met à jour l'état du job suivi par le client en polling.
 */

// FASTAPI_INTERNAL_URL est injecté par Docker Compose (nom du service).
// BACKEND_URL est utilisé en développement local.
const BACKEND_URL      = process.env.FASTAPI_INTERNAL_URL ?? process.env.BACKEND_URL ?? "http://localhost:8000";
const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY ?? "";

/**
 * Lance l'analyse asynchrone des affectations.
 *
 * Le traitement lourd (chargement des données, appel FastAPI, persistance)
 * s'exécute en arrière-plan. La réponse est immédiate avec un jobId.
 * Le client poll GET /api/affectations/analyze/status?jobId=xxx pour suivre
 * la progression.
 *
 * @route POST /api/affectations/analyze
 * @body  { sessionId, programId?, topN?, minScore? }
 * @returns { success: true, jobId: string }
 */
export async function POST(request) {
  const { session, error } = await requireRole("RH", "ADMIN");
  if (error) return error;

  let body;
  try { body = await request.json(); }
  catch {
    return NextResponse.json({ success: false, message: "Corps de requête invalide." }, { status: 400 });
  }

  const { sessionId, programId } = body ?? {};
  if (!sessionId) {
    return NextResponse.json({ success: false, message: "sessionId est requis." }, { status: 400 });
  }

  // Rate limiting : max 3 analyses par minute par session
  const rl = checkRateLimit(`${sessionId}:analyze`, 3, 60_000);
  if (!rl.allowed) return rateLimitResponse(rl.retryAfterSec);

  // Vérification rapide de la session + chargement config
  const existingSession = await prisma.session.findUnique({ where: { id: sessionId } });
  if (!existingSession) {
    return NextResponse.json({ success: false, message: "Session non trouvée." }, { status: 404 });
  }

  const weightsConfig = await prisma.weightsConfig.findUnique({ where: { sessionId } });
  console.log(`[analyze] weightsConfig brut:`, JSON.stringify(weightsConfig));
  const topN     = weightsConfig?.topN     ?? 5;
  const minScore = weightsConfig?.minScore ?? 25;
  console.log(`[analyze] topN=${topN} minScore=${minScore}`);

  // Créer le job et lancer le traitement en arrière-plan
  const jobId  = randomUUID();
  const ipAddr = getIp(request);
  createJob(jobId);

  void runAnalysisBackground(jobId, {
    sessionId,
    programId,
    topN,
    minScore,
    userId:    session.user.id,
    userEmail: session.user.email,
    userRole:  session.user.role,
    ipAddress: ipAddr,
  });

  return NextResponse.json({ success: true, jobId });
}

/**
 * Exécute toutes les étapes de l'analyse en arrière-plan et met à jour le job à
 * chaque étape (chargement données, appel FastAPI, filtrage, persistance, audit).
 *
 * @param {string} jobId - Identifiant du job créé dans le jobStore.
 * @param {Object} options - Paramètres de l'analyse.
 * @param {string} options.sessionId - Session ciblée.
 * @param {string} [options.programId] - Programme optionnel pour filtrer les cours.
 * @param {number} options.topN - Nombre maximum de professeurs proposés par cours.
 * @param {number} options.minScore - Score minimal pour retenir une proposition.
 * @param {string} options.userId - Identifiant de l'utilisateur déclencheur (audit).
 * @param {string} options.userEmail - Email de l'utilisateur (audit).
 * @param {string} options.userRole - Rôle de l'utilisateur (audit).
 * @param {string|null} options.ipAddress - Adresse IP du client (audit).
 * @returns {Promise<void>} Met à jour le job (DONE/ERROR) sans valeur de retour.
 */
async function runAnalysisBackground(jobId, { sessionId, programId, topN, minScore, userId, userEmail, userRole, ipAddress }) {
  const step = (index, label) =>
    updateJob(jobId, { status: "RUNNING", step: label, stepIndex: index });

  try {
    step(0, "Chargement des pondérations...");
    const weightsConfig = await prisma.weightsConfig.findUnique({ where: { sessionId } });
    const comp  = weightsConfig?.competencesPct ?? 40;
    const exp   = weightsConfig?.experiencePct  ?? 25;
    const form  = weightsConfig?.formationPct   ?? 20;
    const hist  = weightsConfig?.historiquePct  ?? 15;
    const total = comp + exp + form + hist;
    const weights = {
      skills_weight:     comp / total,
      experience_weight: exp  / total,
      education_weight:  form / total,
      history_weight:    hist / total,
    };

    step(1, "Chargement des professeurs...");
    const professors = await prisma.professor.findMany({
      where: { user: { isActive: true } },
      include: {
        user:        { select: { nom: true, prenom: true, email: true } },
        skills:      { include: { skill: { select: { id: true, nom: true } } } },
        formations:  true,
        experiences: true,
        assignments: {
          where:   { sessionId: { not: sessionId }, statut: "FINALISEE" },
          include: { course: { select: { id: true, code: true } } },
        },
      },
    });

    if (professors.length === 0) {
      updateJob(jobId, { status: "ERROR", error: "Aucun professeur actif trouvé.", completedAt: Date.now() });
      return;
    }

    step(2, "Chargement des cours...");
    const courses = await prisma.course.findMany({
      where: {
        isArchived: false,
        ...(programId ? { programs: { some: { id: programId } } } : {}),
      },
      include: {
        courseSkills: { include: { skill: { select: { id: true, nom: true } } } },
        programs:     { select: { id: true, code: true, nom: true } },
      },
    });

    if (courses.length === 0) {
      updateJob(jobId, {
        status: "ERROR",
        error:  programId ? "Aucun cours actif pour ce programme." : "Aucun cours actif trouvé.",
        completedAt: Date.now(),
      });
      return;
    }

    step(3, "Calcul des scores par l'IA...");

    const professorPayload = professors.map((prof) => ({
      id:              prof.id,
      firstName:       prof.user.prenom,
      lastName:        prof.user.nom,
      skills:          prof.skills.map((s) => ({ skillId: s.skillId, niveau: s.niveau })),
      yearsExperience: calcYearsExperience(prof.experiences),
      education:       prof.formations.map((f) => ({ niveauDiplome: f.niveauDiplome })),
      history:         prof.assignments.map((a) => a.course.id),
    }));

    const coursePayload = courses.map((c) => ({
      id:              c.id,
      nom:             c.nom,
      required_skills: c.courseSkills.map((cs) => ({
        skillId:       cs.skillId,
        niveauRequis:  cs.niveauRequis,
        poidsCritique: cs.poidsCritique,
      })),
    }));
    const controller = new AbortController();
    const timeoutId  = setTimeout(() => controller.abort(), 90_000); // 90s pour le background
    let backendRes;
    try {
      backendRes = await fetch(`${BACKEND_URL}/calculate-assignments/`, {
        method:  "POST",
        headers: { "Content-Type": "application/json", "x-internal-api-key": INTERNAL_API_KEY },
        body:    JSON.stringify({ session_id: sessionId, professors: professorPayload, courses: coursePayload, ...weights }),
        signal:  controller.signal,
      });
    } catch (fetchErr) {
      const msg = fetchErr.name === "AbortError"
        ? "Le service d'analyse n'a pas répondu à temps (90s)."
        : fetchErr.code === "ECONNREFUSED"
          ? "Le service d'analyse est indisponible. Vérifiez que le backend est démarré."
          : fetchErr.message;
      updateJob(jobId, { status: "ERROR", error: msg, completedAt: Date.now() });
      return;
    } finally {
      clearTimeout(timeoutId);
    }

    if (!backendRes.ok) {
      const err = await backendRes.json().catch(() => ({}));
      updateJob(jobId, {
        status: "ERROR",
        error:  err.detail ?? `Erreur backend : ${backendRes.status}`,
        completedAt: Date.now(),
      });
      return;
    }

    const { assignments: rawAssignments = [] } = await backendRes.json();

    step(4, "Filtrage des propositions...");

    // ── Sélection : max topN professeurs par cours, aucune limite par prof ───
    // Le RH voit tous les candidats qualifiés pour chaque cours (score ≥ minScore)
    // et décide manuellement de la charge de chaque professeur.
    // ─────────────────────────────────────────────────────────────────────────
    const sorted = rawAssignments
      .filter((a) => a.score >= minScore)
      .sort((a, b) => b.score - a.score);

    const courseCount = new Map(); // courseId → nb profs sélectionnés

    const assignments = [];
    for (const a of sorted) {
      const nbForCourse = courseCount.get(a.course_id) ?? 0;
      if (nbForCourse >= topN) continue;

      assignments.push(a);
      courseCount.set(a.course_id, nbForCourse + 1);
    }

    step(5, "Sauvegarde en base de données...");
    await prisma.$transaction(async (tx) => {
      // Verrou pessimiste sur la ligne Session.
      // Si un autre job tourne en parallèle sur la même session, il attend ici
      // jusqu'à la fin de cette transaction — garantit un seul delete+insert à la fois.
      await tx.$executeRaw`
        SELECT id FROM "Session" WHERE id = ${sessionId} FOR UPDATE
      `;

      await tx.assignment.deleteMany({ where: { sessionId, statut: "PROPOSEE" } });
      if (assignments.length > 0) {
        await tx.assignment.createMany({
          data: assignments.map((p) => ({
            sessionId,
            professorId: p.professor_id,
            courseId:    p.course_id,
            score:       p.score,
            scoreDetail: p.score_detail,
            statut:      "PROPOSEE",
          })),
          skipDuplicates: true,
        });
      }
    }, {
      // Si le verrou n'est pas obtenu dans les 30s → erreur plutôt que blocage infini.
      timeout: 30_000,
    });

    step(6, "Finalisation des propositions...");
    const savedAssignments = await prisma.assignment.findMany({
      where:  { sessionId },
      select: { id: true, courseId: true, professorId: true },
    });
    const assignmentIdMap = Object.fromEntries(
      savedAssignments.map((a) => [`${a.courseId}-${a.professorId}`, a.id])
    );

    const profMap   = Object.fromEntries(professors.map((p) => [p.id, p]));
    const courseMap = Object.fromEntries(courses.map((c) => [c.id, c]));

    const proposals = assignments.map((p) => {
      const prof   = profMap[p.professor_id];
      const course = courseMap[p.course_id];
      return {
        id:        assignmentIdMap[`${p.course_id}-${p.professor_id}`],
        sessionId,
        role:      session.user.role,
        cours: {
          id:         course.id,
          code:       course.code,
          nom:        course.nom,
          etape:      course.etape,
          programmes: course.programs ?? [],
        },
        professeur: {
          id:          prof.id,
          prenom:      prof.user.prenom,
          nom:         prof.user.nom,
          email:       prof.user.email,
          competences: prof.skills.map((s) => s.skill.nom),
          experience:  parseFloat(calcYearsExperience(prof.experiences).toFixed(2)),
          formation:   getBestDiploma(prof.formations),
          historique:  prof.assignments.map((a) => a.course.code),
        },
        score:       p.score,
        scoreDetail: p.score_detail,
        statut:      "PROPOSEE",
        notes:       null,
      };
    });

    await prisma.auditLog.create({
      data: {
        action:     "ANALYZE",
        entityType: "AFFECTATION",
        entityId:   sessionId,
        userId,
        metadata: {
          email:           userEmail,
          role:            userRole,
          message:         "Analyse automatique des affectations lancée",
          sessionId,
          programId:       programId ?? null,
          rawPropositions: rawAssignments.length,
          propositions:    proposals.length,
          topN,
          minScore,
        },
        ipAddress,
      },
    });

    updateJob(jobId, {
      status:      "DONE",
      step:        `${proposals.length} proposition(s) générée(s).`,
      stepIndex:   7,
      data:        proposals,
      completedAt: Date.now(),
    });

  } catch (err) {
    console.error(`[analyze] Job ${jobId} échoué :`, err);
    updateJob(jobId, {
      status:      "ERROR",
      error:       err.message || "Erreur interne.",
      completedAt: Date.now(),
    });
  }
}

/**
 * Calcule le nombre total d'années d'expérience cumulées.
 * @param {Array<{dateDebut: string, dateFin?: string}>} experiences - Expériences professionnelles.
 * @returns {number} Années d'expérience (décimales).
 */
function calcYearsExperience(experiences) {
  const now = Date.now();
  return experiences.reduce((total, exp) => {
    const start = new Date(exp.dateDebut).getTime();
    const end   = exp.dateFin ? new Date(exp.dateFin).getTime() : now;
    return total + Math.max(0, (end - start) / (1000 * 60 * 60 * 24 * 365.25));
  }, 0);
}

/**
 * Retourne le diplôme le plus élevé parmi les formations.
 * @param {Array<{niveauDiplome: string}>} formations - Formations du professeur.
 * @returns {string|null} Niveau de diplôme le plus élevé, ou null si aucune formation.
 */
function getBestDiploma(formations) {
  if (!formations.length) return null;
  const order = ["DOCTORATE", "MASTERS", "BACHELORS", "DEC", "OTHER"];
  return formations.map((f) => f.niveauDiplome).sort((a, b) => order.indexOf(a) - order.indexOf(b))[0] ?? null;
}
