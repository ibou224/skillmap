import { NextResponse } from "next/server";
import prisma from "@/lib/prisma.js";
import { requireRole } from "@/lib/permission.js";

const BACKEND_URL    = process.env.BACKEND_URL    ?? "http://localhost:8000";
const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY ?? "";

// ── Route POST /api/affectations/analyze ─────────────────────────────────────
export async function POST(request) {
  const { error } = await requireRole("RH", "ADMIN");
  if (error) return error;

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "Corps de requête invalide." },
      { status: 400 }
    );
  }

  const { sessionId, programId } = body ?? {};
  if (!sessionId) {
    return NextResponse.json(
      { success: false, message: "sessionId est requis." },
      { status: 400 }
    );
  }

  try {
    // 1. Pondérations de la session (défauts si absentes)
    const weightsConfig = await prisma.weightsConfig.findUnique({
      where: { sessionId },
    });

    const comp = weightsConfig?.competencesPct ?? 40;
    const exp  = weightsConfig?.experiencePct  ?? 25;
    const form = weightsConfig?.formationPct   ?? 20;
    const hist = weightsConfig?.historiquePct  ?? 15;

    // Le backend n'accepte que 4 poids qui doivent sommer à 1.0
    const total = comp + exp + form + hist;
    const weights = {
      skills_weight:     comp / total,
      experience_weight: exp  / total,
      education_weight:  form / total,
      history_weight:    hist / total,
    };

    // 2. Professeurs actifs avec tout leur profil
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
      return NextResponse.json(
        { success: false, message: "Aucun professeur actif trouvé." },
        { status: 404 }
      );
    }

    // 3. Cours actifs (filtrés par programme si fourni)
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
      return NextResponse.json(
        {
          success: false,
          message: programId
            ? "Aucun cours actif trouvé pour ce programme."
            : "Aucun cours actif trouvé.",
        },
        { status: 404 }
      );
    }

    // 4. Transformation au format attendu par le backend FastAPI
    const professorPayload = professors.map((prof) => ({
      id:             prof.id,
      firstName:      prof.user.prenom,
      lastName:       prof.user.nom,
      skills:         prof.skills.map((s) => ({ skillId: s.skillId, niveau: s.niveau })),
      yearsExperience: calcYearsExperience(prof.experiences),
      education:      prof.formations.map((f) => ({ niveauDiplome: f.niveauDiplome })),
      history:        prof.assignments.map((a) => a.course.id),
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

    // 5. Appel au backend FastAPI
    const backendRes = await fetch(`${BACKEND_URL}/calculate-assignments/run`, {
      method:  "POST",
      headers: {
        "Content-Type":      "application/json",
        "x-internal-api-key": INTERNAL_API_KEY,
      },
      body: JSON.stringify({
        session_id:  sessionId,
        professors:  professorPayload,
        courses:     coursePayload,
        ...weights,
      }),
    });

    if (!backendRes.ok) {
      const err = await backendRes.json().catch(() => ({}));
      throw new Error(err.detail ?? `Erreur backend : ${backendRes.status}`);
    }

    const { assignments = [] } = await backendRes.json();

    // 6. Garder la meilleure proposition par cours
    const bestPerCourse = new Map();
    for (const a of assignments) {
      if (!bestPerCourse.has(a.course_id) || a.score > bestPerCourse.get(a.course_id).score) {
        bestPerCourse.set(a.course_id, a);
      }
    }
    const topProposals = Array.from(bestPerCourse.values());

    // 7. Persister en DB (remplace les affectations existantes)
    await prisma.$transaction(async (tx) => {
      await tx.assignment.deleteMany({ where: { sessionId } });
      if (topProposals.length > 0) {
        await tx.assignment.createMany({
          data: topProposals.map((p) => ({
            sessionId,
            professorId: p.professor_id,
            courseId:    p.course_id,
            score:       p.score,
            scoreDetail: p.score_detail,
            statut:      "PROPOSEE",
          })),
        });
      }
    });

    // 8. Récupérer les vrais IDs depuis la DB après transaction
    const savedAssignments = await prisma.assignment.findMany({
      where:  { sessionId },
      select: { id: true, courseId: true },
    });
    const assignmentIdMap = Object.fromEntries(
      savedAssignments.map((a) => [a.courseId, a.id])
    );

    // 9. Enrichissement pour le frontend
    const profMap   = Object.fromEntries(professors.map((p) => [p.id, p]));
    const courseMap = Object.fromEntries(courses.map((c) => [c.id, c]));

    const proposals = topProposals.map((p) => {
      const prof   = profMap[p.professor_id];
      const course = courseMap[p.course_id];
      return {
        id:        assignmentIdMap[p.course_id],
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
      };
    });

    return NextResponse.json({
      success: true,
      message: `${proposals.length} proposition(s) générée(s).`,
      data:    proposals,
    });

  } catch (err) {
    console.error("Erreur lors de l'analyse des affectations :", err);
    return NextResponse.json(
      { success: false, message: err.message || "Erreur interne lors de l'analyse." },
      { status: 500 }
    );
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
  return formations
    .map((f) => f.niveauDiplome)
    .sort((a, b) => order.indexOf(a) - order.indexOf(b))[0] ?? null;
}
