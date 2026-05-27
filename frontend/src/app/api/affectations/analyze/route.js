import { NextResponse } from "next/server";
import prisma from "@/lib/prisma.js";
import { requireRole, getIp } from "@/lib/permission.js";

const BACKEND_URL      = process.env.BACKEND_URL      ?? "http://localhost:8000";
const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY ?? "";

/**
 * Lance l'analyse automatique des affectations via le backend FastAPI.
 *
 * 1. Récupère les pondérations configurées pour la session.
 * 2. Charge les professeurs actifs et les cours non archivés.
 * 3. Envoie les données au backend FastAPI qui calcule les scores.
 * 4. Filtre les résultats côté Next.js : score >= minScore, top topN par cours.
 * 5. Remplace les affectations PROPOSEE existantes en base.
 * 6. Retourne les propositions enrichies.
 *
 * @route POST /api/affectations/analyze
 * @body  { sessionId, programId?, topN?, minScore? }
 */
export async function POST(request) {
  const { session, error } = await requireRole("RH", "ADMIN");
  if (error) return error;

  let body;
  try { body = await request.json(); }
  catch {
    return NextResponse.json({ success: false, message: "Corps de requête invalide." }, { status: 400 });
  }

  const { sessionId, programId, topN = 5, minScore = 25 } = body ?? {};
  if (!sessionId) {
    return NextResponse.json({ success: false, message: "sessionId est requis." }, { status: 400 });
  }

  const existingSession = await prisma.session.findUnique({ where: { id: sessionId } });
  if (!existingSession) {
    return NextResponse.json({ success: false, message: "Session non trouvée." }, { status: 404 });
  }

  try {
    // 1. Pondérations
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

    // 2. Professeurs actifs
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
      return NextResponse.json({ success: false, message: "Aucun professeur actif trouvé." }, { status: 404 });
    }

    // 3. Cours actifs
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
      return NextResponse.json({
        success: false,
        message: programId ? "Aucun cours actif trouvé pour ce programme." : "Aucun cours actif trouvé.",
      }, { status: 404 });
    }

    // 4. Payload FastAPI
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

    // 5. Appel FastAPI
    const controller = new AbortController();
    const timeoutId  = setTimeout(() => controller.abort(), 60_000);
    let backendRes;
    try {
      backendRes = await fetch(`${BACKEND_URL}/calculate-assignments/`, {
        method:  "POST",
        headers: { "Content-Type": "application/json", "x-internal-api-key": INTERNAL_API_KEY },
        body:    JSON.stringify({ session_id: sessionId, professors: professorPayload, courses: coursePayload, ...weights }),
        signal:  controller.signal,
      });
    } catch (fetchErr) {
      if (fetchErr.name === "AbortError") {
        return NextResponse.json({ success: false, message: "Le service d'analyse n'a pas répondu à temps." }, { status: 504 });
      }
      throw fetchErr;
    } finally {
      clearTimeout(timeoutId);
    }

    if (!backendRes.ok) {
      const err = await backendRes.json().catch(() => ({}));
      throw new Error(err.detail ?? `Erreur backend : ${backendRes.status}`);
    }

    const { assignments: rawAssignments = [] } = await backendRes.json();

    // 6. Filtrage Next.js : score minimum + top N par cours
    //    Le Python retourne toutes les combinaisons triées par score desc —
    //    on filtre ici sans toucher à l'algorithme.
    const byCoursMap = new Map();
    for (const a of rawAssignments) {
      if (a.score < minScore) continue;
      if (!byCoursMap.has(a.course_id)) byCoursMap.set(a.course_id, []);
      byCoursMap.get(a.course_id).push(a);
    }
    const assignments = [];
    for (const [, list] of byCoursMap) {
      assignments.push(...list.slice(0, topN));
    }

    // 7. Persister en BD (remplace les PROPOSEE existantes)
    await prisma.$transaction(async (tx) => {
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
    });

    // 8. Récupérer les IDs réels depuis la BD
    const savedAssignments = await prisma.assignment.findMany({
      where:  { sessionId },
      select: { id: true, courseId: true, professorId: true },
    });
    const assignmentIdMap = Object.fromEntries(
      savedAssignments.map((a) => [`${a.courseId}-${a.professorId}`, a.id])
    );

    // 9. Enrichissement pour le frontend
    const profMap   = Object.fromEntries(professors.map((p) => [p.id, p]));
    const courseMap = Object.fromEntries(courses.map((c) => [c.id, c]));

    const proposals = assignments.map((p) => {
      const prof   = profMap[p.professor_id];
      const course = courseMap[p.course_id];
      return {
        id:        assignmentIdMap[`${p.course_id}-${p.professor_id}`],
        sessionId,
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
        userId:     session.user.id,
        metadata: {
          email:           session.user.email,
          role:            session.user.role,
          message:         "Analyse automatique des affectations lancée",
          sessionId,
          programId:       programId ?? null,
          rawPropositions: rawAssignments.length,
          propositions:    proposals.length,
          topN,
          minScore,
        },
        ipAddress: getIp(request),
      },
    });

    return NextResponse.json({
      success: true,
      message: `${proposals.length} proposition(s) générée(s).`,
      data: proposals,
    });

  } catch (err) {
    console.error("Erreur analyse affectations :", err);
    return NextResponse.json({ success: false, message: err.message || "Erreur interne." }, { status: 500 });
  }
}

// ── Utilitaires ───────────────────────────────────────────────────────────────

function calcYearsExperience(experiences) {
  const now = Date.now();
  return experiences.reduce((total, exp) => {
    const start = new Date(exp.dateDebut).getTime();
    const end   = exp.dateFin ? new Date(exp.dateFin).getTime() : now;
    return total + Math.max(0, (end - start) / (1000 * 60 * 60 * 24 * 365.25));
  }, 0);
}

function getBestDiploma(formations) {
  if (!formations.length) return null;
  const order = ["DOCTORATE", "MASTERS", "BACHELORS", "DEC", "OTHER"];
  return formations.map((f) => f.niveauDiplome).sort((a, b) => order.indexOf(a) - order.indexOf(b))[0] ?? null;
}
