import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextResponse } from "next/server";

const mockPrisma = vi.hoisted(() => ({
  skill:    { findMany: vi.fn(), create: vi.fn() },
  auditLog: { create: vi.fn() },
}));

const mockRequireRole = vi.hoisted(() => vi.fn());
const mockGetIp       = vi.hoisted(() => vi.fn().mockReturnValue("127.0.0.1"));

vi.mock("@/lib/prisma",     () => ({ default: mockPrisma }));
vi.mock("@/lib/permission", () => ({ requireRole: mockRequireRole, getIp: mockGetIp }));

import { GET, POST } from "@/app/api/skills/route";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function sessionFor(role, id = "user-1", email = "test@example.com") {
  return { user: { id, role, email } };
}

function makePostReq(body) {
  return new Request("http://localhost/api/skills", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

// ---------------------------------------------------------------------------
// GET /api/skills
// ---------------------------------------------------------------------------
describe("GET /api/skills", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 when not authenticated", async () => {
    mockRequireRole.mockResolvedValue({
      error: NextResponse.json({ success: false }, { status: 401 }),
    });
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it("returns skill list", async () => {
    mockRequireRole.mockResolvedValue({ session: sessionFor("ADMIN") });
    const skills = [
      { id: "1", nom: "JavaScript", categorie: "Web", description: null },
      { id: "2", nom: "Python",     categorie: "IA",  description: "Scripting" },
    ];
    mockPrisma.skill.findMany.mockResolvedValue(skills);

    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data).toEqual(skills);
  });

  it("returns 500 when prisma throws", async () => {
    mockRequireRole.mockResolvedValue({ session: sessionFor("RH") });
    mockPrisma.skill.findMany.mockRejectedValue(new Error("DB error"));

    const res = await GET();
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// POST /api/skills
// ---------------------------------------------------------------------------
describe("POST /api/skills", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 when not authenticated", async () => {
    mockRequireRole.mockResolvedValue({
      error: NextResponse.json({ success: false }, { status: 401 }),
    });
    const res = await POST(makePostReq({ nom: "JS", categorie: "Web" }));
    expect(res.status).toBe(401);
  });

  it("returns 400 when nom is empty", async () => {
    mockRequireRole.mockResolvedValue({ session: sessionFor("ADMIN") });
    const res = await POST(makePostReq({ nom: "", categorie: "Web" }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error).toMatch(/nom/i);
  });

  it("returns 400 when nom is blank whitespace", async () => {
    mockRequireRole.mockResolvedValue({ session: sessionFor("ADMIN") });
    const res = await POST(makePostReq({ nom: "   ", categorie: "Web" }));
    expect(res.status).toBe(400);
  });

  it("returns 400 when categorie is empty", async () => {
    mockRequireRole.mockResolvedValue({ session: sessionFor("ADMIN") });
    const res = await POST(makePostReq({ nom: "Python", categorie: "" }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/cat[eé]gorie/i);
  });

  it("creates a skill and writes an audit log", async () => {
    mockRequireRole.mockResolvedValue({ session: sessionFor("ADMIN", "u1", "admin@test.com") });
    const created = { id: "skill-1", nom: "Python", categorie: "IA", description: null };
    mockPrisma.skill.create.mockResolvedValue(created);
    mockPrisma.auditLog.create.mockResolvedValue({});

    const res = await POST(makePostReq({ nom: "Python", categorie: "IA" }));
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data).toEqual(created);

    expect(mockPrisma.auditLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          action: "CREATE",
          entityType: "COMPETENCE",
          entityId: "skill-1",
          userId: "u1",
        }),
      })
    );
  });

  it("trims whitespace from nom and categorie", async () => {
    mockRequireRole.mockResolvedValue({ session: sessionFor("ADMIN") });
    mockPrisma.skill.create.mockResolvedValue({ id: "s1", nom: "Python", categorie: "IA", description: null });
    mockPrisma.auditLog.create.mockResolvedValue({});

    await POST(makePostReq({ nom: "  Python  ", categorie: "  IA  " }));

    expect(mockPrisma.skill.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ nom: "Python", categorie: "IA" }),
      })
    );
  });

  it("returns 409 on Prisma unique-constraint error (P2002)", async () => {
    mockRequireRole.mockResolvedValue({ session: sessionFor("ADMIN") });
    const err = Object.assign(new Error("Unique constraint failed"), { code: "P2002" });
    mockPrisma.skill.create.mockRejectedValue(err);

    const res = await POST(makePostReq({ nom: "Python", categorie: "IA" }));
    expect(res.status).toBe(409);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error).toMatch(/existe/i);
  });

  it("returns 500 on unexpected database error", async () => {
    mockRequireRole.mockResolvedValue({ session: sessionFor("RH") });
    mockPrisma.skill.create.mockRejectedValue(new Error("DB down"));

    const res = await POST(makePostReq({ nom: "Java", categorie: "Backend" }));
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.success).toBe(false);
  });
});
