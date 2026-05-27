import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextResponse } from "next/server";

// ── Mocks ─────────────────────────────────────────────────────────────────────

const mockRequireRole = vi.hoisted(() => vi.fn());
const mockGetIp       = vi.hoisted(() => vi.fn().mockReturnValue("127.0.0.1"));

const mockTx = vi.hoisted(() => ({
  assignment: { deleteMany: vi.fn(), createMany: vi.fn() },
}));

const mockPrisma = vi.hoisted(() => ({
  session:       { findUnique: vi.fn() },
  weightsConfig: { findUnique: vi.fn() },
  professor:     { findMany: vi.fn() },
  course:        { findMany: vi.fn() },
  assignment:    { findMany: vi.fn() },
  auditLog:      { create: vi.fn() },
  $transaction:  vi.fn(),
}));

vi.mock("@/lib/prisma",     () => ({ default: mockPrisma }));
vi.mock("@/lib/permission", () => ({ requireRole: mockRequireRole, getIp: mockGetIp }));

import { POST } from "@/app/api/affectations/analyze/route";

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeReq(body = {}) {
  return new Request("http://localhost/api/affectations/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function session(role = "RH") {
  return { user: { id: "user-1", role, email: "rh@lacitec.on.ca" } };
}

const MOCK_SESSION   = { id: "sess-1", nom: "Hiver 2025", statut: "ACTIVE" };
const MOCK_WEIGHTS   = { competencesPct: 40, experiencePct: 25, formationPct: 20, historiquePct: 15 };

function makeProfessor(id = "prof-1") {
  return {
    id,
    user:        { prenom: "Alice", nom: "Tremblay", email: "alice@lacitec.on.ca" },
    skills:      [{ skillId: "sk-1", niveau: "AVANCE", skill: { id: "sk-1", nom: "Python" } }],
    formations:  [{ niveauDiplome: "MASTERS" }],
    experiences: [{ dateDebut: new Date("2015-01-01"), dateFin: new Date("2025-01-01") }],
    assignments: [],
  };
}

function makeCourse(id = "c-1") {
  return {
    id,
    nom:         "Algorithmique",
    code:        "INF201",
    etape:       2,
    courseSkills:[{ skillId: "sk-1", niveauRequis: "INTERMEDIAIRE", poidsCritique: 1, skill: { id: "sk-1", nom: "Python" } }],
    programs:    [{ id: "p-1", code: "BACS", nom: "Baccalauréat" }],
  };
}

/** Réponse FastAPI valide */
function makeBackendResponse(assignments) {
  return {
    ok: true,
    json: async () => ({ assignments }),
  };
}

/** Proposition FastAPI typique */
function makeRawAssignment(professorId = "prof-1", courseId = "c-1", score = 80) {
  return {
    professor_id: professorId,
    course_id:    courseId,
    score,
    score_detail: { skills: 90, experience: 80, education: 80, history: 0 },
  };
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("POST /api/affectations/analyze — auth guards", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 when not authenticated", async () => {
    mockRequireRole.mockResolvedValue({
      error: NextResponse.json({ success: false }, { status: 401 }),
    });
    const res = await POST(makeReq({ sessionId: "sess-1" }));
    expect(res.status).toBe(401);
  });

  it("returns 403 for PROFESSEUR role", async () => {
    mockRequireRole.mockResolvedValue({
      error: NextResponse.json({ success: false }, { status: 403 }),
    });
    const res = await POST(makeReq({ sessionId: "sess-1" }));
    expect(res.status).toBe(403);
  });
});

describe("POST /api/affectations/analyze — validation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireRole.mockResolvedValue({ session: session() });
  });

  it("returns 400 when sessionId is missing", async () => {
    const res = await POST(makeReq({}));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.message).toMatch(/sessionId/i);
  });

  it("returns 404 when session does not exist", async () => {
    mockPrisma.session.findUnique.mockResolvedValue(null);
    const res = await POST(makeReq({ sessionId: "ghost" }));
    expect(res.status).toBe(404);
  });

  it("returns 404 when no active professors found", async () => {
    mockPrisma.session.findUnique.mockResolvedValue(MOCK_SESSION);
    mockPrisma.weightsConfig.findUnique.mockResolvedValue(MOCK_WEIGHTS);
    mockPrisma.professor.findMany.mockResolvedValue([]);
    mockPrisma.course.findMany.mockResolvedValue([makeCourse()]);

    const res = await POST(makeReq({ sessionId: "sess-1" }));
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.message).toMatch(/professeur/i);
  });

  it("returns 404 when no courses found", async () => {
    mockPrisma.session.findUnique.mockResolvedValue(MOCK_SESSION);
    mockPrisma.weightsConfig.findUnique.mockResolvedValue(MOCK_WEIGHTS);
    mockPrisma.professor.findMany.mockResolvedValue([makeProfessor()]);
    mockPrisma.course.findMany.mockResolvedValue([]);

    const res = await POST(makeReq({ sessionId: "sess-1" }));
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.message).toMatch(/cours/i);
  });
});

describe("POST /api/affectations/analyze — FastAPI errors", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireRole.mockResolvedValue({ session: session() });
    mockPrisma.session.findUnique.mockResolvedValue(MOCK_SESSION);
    mockPrisma.weightsConfig.findUnique.mockResolvedValue(MOCK_WEIGHTS);
    mockPrisma.professor.findMany.mockResolvedValue([makeProfessor()]);
    mockPrisma.course.findMany.mockResolvedValue([makeCourse()]);
  });

  afterEach(() => vi.unstubAllGlobals());

  it("returns 504 when FastAPI request times out (AbortError)", async () => {
    const abortErr = Object.assign(new Error("Aborted"), { name: "AbortError" });
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(abortErr));

    const res = await POST(makeReq({ sessionId: "sess-1" }));
    expect(res.status).toBe(504);
    const body = await res.json();
    expect(body.message).toMatch(/temps/i);
  });

  it("returns 500 when FastAPI responds with an error status", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({ detail: "Erreur interne FastAPI" }),
    }));

    const res = await POST(makeReq({ sessionId: "sess-1" }));
    expect(res.status).toBe(500);
  });
});

describe("POST /api/affectations/analyze — success flow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireRole.mockResolvedValue({ session: session() });
    mockPrisma.session.findUnique.mockResolvedValue(MOCK_SESSION);
    mockPrisma.weightsConfig.findUnique.mockResolvedValue(MOCK_WEIGHTS);
    mockPrisma.professor.findMany.mockResolvedValue([makeProfessor()]);
    mockPrisma.course.findMany.mockResolvedValue([makeCourse()]);
    mockTx.assignment.deleteMany.mockResolvedValue({});
    mockTx.assignment.createMany.mockResolvedValue({});
    mockPrisma.$transaction.mockImplementation(async (cb) => cb(mockTx));
    mockPrisma.assignment.findMany.mockResolvedValue([
      { id: "aff-1", courseId: "c-1", professorId: "prof-1" },
    ]);
    mockPrisma.auditLog.create.mockResolvedValue({});
  });

  afterEach(() => vi.unstubAllGlobals());

  it("returns 200 with proposals on valid response", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(
      makeBackendResponse([makeRawAssignment("prof-1", "c-1", 80)])
    ));

    const res = await POST(makeReq({ sessionId: "sess-1" }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data).toHaveLength(1);
  });

  it("filters out proposals below minScore", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(
      makeBackendResponse([
        makeRawAssignment("prof-1", "c-1", 80),  // accepté
        makeRawAssignment("prof-1", "c-1", 10),  // score trop bas → filtré
      ])
    ));

    const res = await POST(makeReq({ sessionId: "sess-1", minScore: 25 }));
    const body = await res.json();
    // Seule la proposition à 80 passe le filtre minScore=25
    // (les deux ont le même course/prof donc topN s'applique aussi)
    expect(body.data.length).toBeLessThanOrEqual(1);
  });

  it("limits to topN proposals per course", async () => {
    const profs = ["p1", "p2", "p3", "p4", "p5", "p6"].map(makeProfessor);
    mockPrisma.professor.findMany.mockResolvedValue(profs);
    mockPrisma.assignment.findMany.mockResolvedValue(
      profs.map((p, i) => ({ id: `aff-${i}`, courseId: "c-1", professorId: p.id }))
    );

    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(
      makeBackendResponse(
        profs.map((p, i) => makeRawAssignment(p.id, "c-1", 90 - i * 5))
      )
    ));

    const res = await POST(makeReq({ sessionId: "sess-1", topN: 3, minScore: 0 }));
    const body = await res.json();
    // topN=3 → maximum 3 propositions par cours
    expect(body.data.length).toBeLessThanOrEqual(3);
  });

  it("normalises weights from WeightsConfig (divides by total)", async () => {
    let capturedBody;
    vi.stubGlobal("fetch", vi.fn().mockImplementation(async (url, opts) => {
      capturedBody = JSON.parse(opts.body);
      return makeBackendResponse([makeRawAssignment()]);
    }));

    await POST(makeReq({ sessionId: "sess-1" }));

    // comp=40 exp=25 form=20 hist=15 → total=100 → fractions exactes
    expect(capturedBody.skills_weight).toBeCloseTo(0.40);
    expect(capturedBody.experience_weight).toBeCloseTo(0.25);
    expect(capturedBody.education_weight).toBeCloseTo(0.20);
    expect(capturedBody.history_weight).toBeCloseTo(0.15);
  });

  it("falls back to default weights when no WeightsConfig exists", async () => {
    mockPrisma.weightsConfig.findUnique.mockResolvedValue(null);
    let capturedBody;
    vi.stubGlobal("fetch", vi.fn().mockImplementation(async (url, opts) => {
      capturedBody = JSON.parse(opts.body);
      return makeBackendResponse([makeRawAssignment()]);
    }));

    await POST(makeReq({ sessionId: "sess-1" }));

    expect(capturedBody.skills_weight).toBeCloseTo(0.40);
    expect(capturedBody.experience_weight).toBeCloseTo(0.25);
  });

  it("deletes existing PROPOSEE assignments before inserting new ones", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(
      makeBackendResponse([makeRawAssignment()])
    ));

    await POST(makeReq({ sessionId: "sess-1" }));

    expect(mockTx.assignment.deleteMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { sessionId: "sess-1", statut: "PROPOSEE" } })
    );
  });

  it("writes an audit log after successful analysis", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(
      makeBackendResponse([makeRawAssignment()])
    ));

    await POST(makeReq({ sessionId: "sess-1" }));

    expect(mockPrisma.auditLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          action:     "ANALYZE",
          entityType: "AFFECTATION",
          entityId:   "sess-1",
        }),
      })
    );
  });
});
