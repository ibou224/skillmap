import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextResponse } from "next/server";

// ── Mocks ─────────────────────────────────────────────────────────────────────

const mockRequireRole = vi.hoisted(() => vi.fn());
const mockGetIp       = vi.hoisted(() => vi.fn().mockReturnValue("127.0.0.1"));

const mockPrisma = vi.hoisted(() => ({
  assignment: { findUnique: vi.fn(), update: vi.fn() },
  auditLog:   { create: vi.fn() },
}));

vi.mock("@/lib/prisma",     () => ({ default: mockPrisma }));
vi.mock("@/lib/permission", () => ({ requireRole: mockRequireRole, getIp: mockGetIp }));

import { PATCH } from "@/app/api/affectations/[id]/route";

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeReq(body = {}) {
  return new Request("http://localhost/api/affectations/aff-1", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const PARAMS = { params: { id: "aff-1" } };

function session(role = "RH") {
  return { user: { id: "user-1", role, email: "rh@lacitec.on.ca" } };
}

function makeExisting(statut = "PROPOSEE") {
  return { id: "aff-1", statut, sessionId: "s1", professorId: "p1", courseId: "c1" };
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("PATCH /api/affectations/[id] — auth guards", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 when not authenticated", async () => {
    mockRequireRole.mockResolvedValue({
      error: NextResponse.json({ success: false }, { status: 401 }),
    });
    const res = await PATCH(makeReq({ statut: "AJUSTEE" }), PARAMS);
    expect(res.status).toBe(401);
  });

  it("returns 403 for PROFESSEUR role", async () => {
    mockRequireRole.mockResolvedValue({
      error: NextResponse.json({ success: false }, { status: 403 }),
    });
    const res = await PATCH(makeReq({ statut: "AJUSTEE" }), PARAMS);
    expect(res.status).toBe(403);
  });
});

describe("PATCH /api/affectations/[id] — validation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireRole.mockResolvedValue({ session: session() });
  });

  it("returns 400 when statut is missing", async () => {
    const res = await PATCH(makeReq({}), PARAMS);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.message).toMatch(/statut/i);
  });

  it("returns 400 for an unknown statut value", async () => {
    const res = await PATCH(makeReq({ statut: "INCONNU" }), PARAMS);
    expect(res.status).toBe(400);
  });

  it("returns 404 when assignment does not exist", async () => {
    mockPrisma.assignment.findUnique.mockResolvedValue(null);
    const res = await PATCH(makeReq({ statut: "AJUSTEE" }), PARAMS);
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.message).toMatch(/introuvable/i);
  });
});

describe("PATCH /api/affectations/[id] — transition rules", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireRole.mockResolvedValue({ session: session() });
    mockPrisma.auditLog.create.mockResolvedValue({});
  });

  it("allows PROPOSEE → AJUSTEE", async () => {
    mockPrisma.assignment.findUnique.mockResolvedValue(makeExisting("PROPOSEE"));
    mockPrisma.assignment.update.mockResolvedValue(makeExisting("AJUSTEE"));

    const res = await PATCH(makeReq({ statut: "AJUSTEE" }), PARAMS);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
  });

  it("allows AJUSTEE → FINALISEE", async () => {
    mockPrisma.assignment.findUnique.mockResolvedValue(makeExisting("AJUSTEE"));
    mockPrisma.assignment.update.mockResolvedValue(makeExisting("FINALISEE"));

    const res = await PATCH(makeReq({ statut: "FINALISEE" }), PARAMS);
    expect(res.status).toBe(200);
  });

  it("blocks PROPOSEE → FINALISEE (skip de statut)", async () => {
    mockPrisma.assignment.findUnique.mockResolvedValue(makeExisting("PROPOSEE"));

    const res = await PATCH(makeReq({ statut: "FINALISEE" }), PARAMS);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.message).toMatch(/transition/i);
  });

  it("blocks FINALISEE → AJUSTEE (retour en arrière)", async () => {
    mockPrisma.assignment.findUnique.mockResolvedValue(makeExisting("FINALISEE"));

    const res = await PATCH(makeReq({ statut: "AJUSTEE" }), PARAMS);
    expect(res.status).toBe(400);
  });

  it("blocks FINALISEE → PROPOSEE", async () => {
    mockPrisma.assignment.findUnique.mockResolvedValue(makeExisting("FINALISEE"));

    const res = await PATCH(makeReq({ statut: "PROPOSEE" }), PARAMS);
    expect(res.status).toBe(400);
  });

  it("blocks AJUSTEE → PROPOSEE (retour en arrière)", async () => {
    mockPrisma.assignment.findUnique.mockResolvedValue(makeExisting("AJUSTEE"));

    const res = await PATCH(makeReq({ statut: "PROPOSEE" }), PARAMS);
    expect(res.status).toBe(400);
  });

  it("writes an audit log on valid transition", async () => {
    mockPrisma.assignment.findUnique.mockResolvedValue(makeExisting("PROPOSEE"));
    mockPrisma.assignment.update.mockResolvedValue(makeExisting("AJUSTEE"));

    await PATCH(makeReq({ statut: "AJUSTEE" }), PARAMS);

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

describe("PATCH /api/affectations/[id] — error handling", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireRole.mockResolvedValue({ session: session() });
  });

  it("returns 500 when Prisma throws on update", async () => {
    mockPrisma.assignment.findUnique.mockResolvedValue(makeExisting("PROPOSEE"));
    mockPrisma.assignment.update.mockRejectedValue(new Error("DB down"));

    const res = await PATCH(makeReq({ statut: "AJUSTEE" }), PARAMS);
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.success).toBe(false);
  });
});
