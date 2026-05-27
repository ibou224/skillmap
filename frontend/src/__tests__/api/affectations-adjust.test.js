import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextResponse } from "next/server";

// ── Mocks ─────────────────────────────────────────────────────────────────────

const mockRequireRole = vi.hoisted(() => vi.fn());
const mockGetIp       = vi.hoisted(() => vi.fn().mockReturnValue("127.0.0.1"));

const mockPrisma = vi.hoisted(() => ({
  assignment: { findUnique: vi.fn(), update: vi.fn() },
  course:     { findUnique: vi.fn() },
  auditLog:   { create: vi.fn() },
}));

vi.mock("@/lib/prisma",     () => ({ default: mockPrisma }));
vi.mock("@/lib/permission", () => ({ requireRole: mockRequireRole, getIp: mockGetIp }));

import { PATCH } from "@/app/api/affectations/[id]/adjust/route";

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeReq(body = {}) {
  return new Request("http://localhost/api/affectations/aff-1/adjust", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const PARAMS = { params: { id: "aff-1" } };

function session(role = "RH") {
  return { user: { id: "user-1", role, email: "rh@lacitec.on.ca" } };
}

/** Affectation PROPOSEE par défaut */
function makeExisting(overrides = {}) {
  return {
    id: "aff-1", sessionId: "sess-1", professorId: "prof-1", courseId: "old-c",
    statut: "PROPOSEE",
    ...overrides,
  };
}

/** Cours valide par défaut */
function makeCourse(overrides = {}) {
  return { id: "new-c", nom: "Algo", isArchived: false, ...overrides };
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("PATCH /api/affectations/[id]/adjust — auth guards", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 when not authenticated", async () => {
    mockRequireRole.mockResolvedValue({
      error: NextResponse.json({ success: false }, { status: 401 }),
    });
    const res = await PATCH(makeReq({ coursId: "c-1" }), PARAMS);
    expect(res.status).toBe(401);
  });

  it("returns 403 for PROFESSEUR role", async () => {
    mockRequireRole.mockResolvedValue({
      error: NextResponse.json({ success: false }, { status: 403 }),
    });
    const res = await PATCH(makeReq({ coursId: "c-1" }), PARAMS);
    expect(res.status).toBe(403);
  });
});

describe("PATCH /api/affectations/[id]/adjust — validation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireRole.mockResolvedValue({ session: session() });
    mockPrisma.auditLog.create.mockResolvedValue({});
  });

  it("returns 400 when coursId is missing", async () => {
    const res = await PATCH(makeReq({}), PARAMS);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.message).toMatch(/coursid/i);
  });

  it("returns 404 when assignment not found", async () => {
    mockPrisma.assignment.findUnique.mockResolvedValue(null);
    const res = await PATCH(makeReq({ coursId: "new-c" }), PARAMS);
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.message).toMatch(/introuvable/i);
  });

  it("returns 400 when assignment is FINALISEE", async () => {
    mockPrisma.assignment.findUnique.mockResolvedValue(makeExisting({ statut: "FINALISEE" }));
    const res = await PATCH(makeReq({ coursId: "new-c" }), PARAMS);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.message).toMatch(/finalis/i);
  });

  it("returns 404 when the target course does not exist", async () => {
    mockPrisma.assignment.findUnique.mockResolvedValueOnce(makeExisting());
    mockPrisma.course.findUnique.mockResolvedValue(null);
    const res = await PATCH(makeReq({ coursId: "ghost-c" }), PARAMS);
    expect(res.status).toBe(404);
  });

  it("returns 400 when the target course is archived", async () => {
    mockPrisma.assignment.findUnique.mockResolvedValueOnce(makeExisting());
    mockPrisma.course.findUnique.mockResolvedValue(makeCourse({ isArchived: true }));
    const res = await PATCH(makeReq({ coursId: "archived-c" }), PARAMS);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.message).toMatch(/archiv/i);
  });

  it("returns 409 when professor is already assigned to that course in the same session", async () => {
    mockPrisma.assignment.findUnique
      .mockResolvedValueOnce(makeExisting())           // existing
      .mockResolvedValueOnce(makeExisting({ id: "aff-99", courseId: "new-c" })); // conflict
    mockPrisma.course.findUnique.mockResolvedValue(makeCourse({ id: "new-c" }));

    const res = await PATCH(makeReq({ coursId: "new-c" }), PARAMS);
    expect(res.status).toBe(409);
    const body = await res.json();
    expect(body.message).toMatch(/déjà affecté/i);
  });
});

describe("PATCH /api/affectations/[id]/adjust — success", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireRole.mockResolvedValue({ session: session() });
    mockPrisma.assignment.findUnique
      .mockResolvedValueOnce(makeExisting())  // existing
      .mockResolvedValueOnce(null);           // no conflict
    mockPrisma.course.findUnique.mockResolvedValue(makeCourse({ id: "new-c" }));
    mockPrisma.auditLog.create.mockResolvedValue({});
  });

  it("returns 200 and passes the updated assignment", async () => {
    const updated = { id: "aff-1", courseId: "new-c", statut: "AJUSTEE", notes: null };
    mockPrisma.assignment.update.mockResolvedValue(updated);

    const res = await PATCH(makeReq({ coursId: "new-c" }), PARAMS);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.statut).toBe("AJUSTEE");
  });

  it("sets statut to AJUSTEE on update", async () => {
    mockPrisma.assignment.update.mockResolvedValue({ id: "aff-1", statut: "AJUSTEE" });

    await PATCH(makeReq({ coursId: "new-c" }), PARAMS);

    expect(mockPrisma.assignment.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ statut: "AJUSTEE" }) }),
    );
  });

  it("trims and persists notes when provided", async () => {
    mockPrisma.assignment.update.mockResolvedValue({ id: "aff-1", statut: "AJUSTEE", notes: "Bon candidat" });

    await PATCH(makeReq({ coursId: "new-c", notes: "  Bon candidat  " }), PARAMS);

    expect(mockPrisma.assignment.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ notes: "Bon candidat" }) }),
    );
  });

  it("sets notes to null when not provided", async () => {
    mockPrisma.assignment.update.mockResolvedValue({ id: "aff-1", statut: "AJUSTEE", notes: null });

    await PATCH(makeReq({ coursId: "new-c" }), PARAMS);

    expect(mockPrisma.assignment.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ notes: null }) }),
    );
  });

  it("writes an audit log", async () => {
    mockPrisma.assignment.update.mockResolvedValue({ id: "aff-1", statut: "AJUSTEE" });

    await PATCH(makeReq({ coursId: "new-c", notes: "Ok" }), PARAMS);

    expect(mockPrisma.auditLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          action:     "UPDATE",
          entityType: "AFFECTATION",
          entityId:   "aff-1",
          userId:     "user-1",
        }),
      }),
    );
  });
});
