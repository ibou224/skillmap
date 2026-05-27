import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextResponse } from "next/server";

const mockPrisma = vi.hoisted(() => ({
  assignment: { findMany: vi.fn() },
  professor:  { findUnique: vi.fn() },
}));

const mockRequireRole = vi.hoisted(() => vi.fn());

vi.mock("@/lib/prisma",     () => ({ default: mockPrisma }));
vi.mock("@/lib/permission", () => ({ requireRole: mockRequireRole }));

import { GET } from "@/app/api/affectations/route";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function makeReq(url = "http://localhost/api/affectations") {
  return new Request(url);
}

function sessionFor(role, id = "user-1") {
  return { user: { id, role } };
}

function makeDbRow(overrides = {}) {
  return {
    id: "aff-1",
    sessionId: "sess-1",
    statut: "CONFIRME",
    score: 88,
    scoreDetail: null,
    session: { id: "sess-1", nom: "Session Hiver 2024", statut: "ACTIVE" },
    course: {
      id: "c-1", code: "INF101", nom: "Intro Info", etape: 1,
      programs: [{ id: "p-1", code: "BACS", nom: "Baccalauréat en sciences" }],
    },
    professor: {
      id: "prof-1",
      user: { nom: "Tremblay", prenom: "Alice", email: "alice@example.com" },
      skills: [{ skill: { nom: "Python" } }, { skill: { nom: "SQL" } }],
    },
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// 401 / 403
// ---------------------------------------------------------------------------
describe("GET /api/affectations — auth guards", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 when not authenticated", async () => {
    mockRequireRole.mockResolvedValue({
      error: NextResponse.json({ success: false, message: "Authentification requise." }, { status: 401 }),
    });
    const res = await GET(makeReq());
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.success).toBe(false);
  });

  it("returns 403 when role is not allowed", async () => {
    mockRequireRole.mockResolvedValue({
      error: NextResponse.json({ success: false, message: "Accès refusé." }, { status: 403 }),
    });
    const res = await GET(makeReq());
    expect(res.status).toBe(403);
  });
});

// ---------------------------------------------------------------------------
// PROFESSEUR path
// ---------------------------------------------------------------------------
describe("GET /api/affectations — PROFESSEUR", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 404 when professor profile is missing", async () => {
    mockRequireRole.mockResolvedValue({ session: sessionFor("PROFESSEUR") });
    mockPrisma.professor.findUnique.mockResolvedValue(null);

    const res = await GET(makeReq());
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.success).toBe(false);
  });

  it("returns flattened assignments for the logged-in professor", async () => {
    mockRequireRole.mockResolvedValue({ session: sessionFor("PROFESSEUR") });
    mockPrisma.professor.findUnique.mockResolvedValue({ id: "prof-1" });
    mockPrisma.assignment.findMany.mockResolvedValue([makeDbRow()]);

    const res = await GET(makeReq());
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data).toHaveLength(1);

    const row = body.data[0];
    expect(row.sessionId).toBe("sess-1");
    expect(row.sessionNom).toBe("Session Hiver 2024");
    expect(row.sessionStatut).toBe("ACTIVE");
    expect(row.cours.code).toBe("INF101");
    expect(row.professeur.prenom).toBe("Alice");
    expect(row.professeur.competences).toEqual(["Python", "SQL"]);
  });

  it("queries only the professor's own assignments", async () => {
    mockRequireRole.mockResolvedValue({ session: sessionFor("PROFESSEUR") });
    mockPrisma.professor.findUnique.mockResolvedValue({ id: "prof-42" });
    mockPrisma.assignment.findMany.mockResolvedValue([]);

    await GET(makeReq());

    expect(mockPrisma.assignment.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { professorId: "prof-42" } })
    );
  });
});

// ---------------------------------------------------------------------------
// RH / ADMIN path
// ---------------------------------------------------------------------------
describe("GET /api/affectations — RH", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns all assignments with no filter", async () => {
    mockRequireRole.mockResolvedValue({ session: sessionFor("RH") });
    mockPrisma.assignment.findMany.mockResolvedValue([makeDbRow(), makeDbRow({ id: "aff-2" })]);

    const res = await GET(makeReq());
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data).toHaveLength(2);
  });

  it("applies professeurId filter when provided", async () => {
    mockRequireRole.mockResolvedValue({ session: sessionFor("RH") });
    mockPrisma.assignment.findMany.mockResolvedValue([]);

    await GET(makeReq("http://localhost/api/affectations?professeurId=prof-99"));

    expect(mockPrisma.assignment.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ professorId: "prof-99" }) })
    );
  });

  it("applies sessionId filter when provided", async () => {
    mockRequireRole.mockResolvedValue({ session: sessionFor("RH") });
    mockPrisma.assignment.findMany.mockResolvedValue([]);

    await GET(makeReq("http://localhost/api/affectations?sessionId=sess-5"));

    expect(mockPrisma.assignment.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ sessionId: "sess-5" }) })
    );
  });

  it("returns 500 when prisma throws", async () => {
    mockRequireRole.mockResolvedValue({ session: sessionFor("ADMIN") });
    mockPrisma.assignment.findMany.mockRejectedValue(new Error("DB down"));

    const res = await GET(makeReq());
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.success).toBe(false);
  });
});
