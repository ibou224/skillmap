import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextResponse } from "next/server";

// ── Mocks ─────────────────────────────────────────────────────────────────────

const mockRequireRole = vi.hoisted(() => vi.fn());

/**
 * Objet tx passé au callback de $transaction.
 * Chaque méthode est un vi.fn() réinitialisé avant chaque test.
 */
const mockTx = vi.hoisted(() => ({
  cvSnapshot:    { findFirst: vi.fn(), create: vi.fn() },
  professor:     { update: vi.fn(), findUnique: vi.fn() },
  experience:    { deleteMany: vi.fn(), createMany: vi.fn() },
  formation:     { deleteMany: vi.fn(), createMany: vi.fn() },
  professorSkill:{ deleteMany: vi.fn(), create: vi.fn() },
  skill:         { findUnique: vi.fn() },
  cvExtraction:  { updateMany: vi.fn() },
  auditLog:      { create: vi.fn() },
}));

const mockPrisma = vi.hoisted(() => ({
  professor:  { findUnique: vi.fn() },
  $transaction: vi.fn(),
}));

vi.mock("@/lib/prisma",     () => ({ default: mockPrisma }));
vi.mock("@/lib/permission", () => ({ requireRole: mockRequireRole, getIp: () => "127.0.0.1" }));
vi.mock("@/lib/formatData", () => ({
  normalizeInfosProfessor: vi.fn((x) => ({ normalized: true, raw: x })),
}));

import { POST } from "@/app/api/professor/cvs/route";

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeReq(body = {}) {
  return new Request("http://localhost/api/professor/cvs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function sessionFor(role = "PROFESSEUR", id = "user-1") {
  return { user: { id, role, email: "prof@lacitec.on.ca" } };
}

/** Profil professeur minimal tel que retourné par Prisma */
function makeProfDB(overrides = {}) {
  return {
    id:         "prof-1",
    telephone:  "613-555-0100",
    ville:      "Ottawa",
    siteWeb:    null,
    linkedIn:   null,
    resume:     "Résumé test",
    langues:    ["Français"],
    skills:     [],
    experiences:[],
    formations: [],
    user:       { id: "user-1", email: "prof@lacitec.on.ca", nom: "Tremblay", prenom: "Alice", role: "PROFESSEUR" },
    cvExtractions: [],
    ...overrides,
  };
}

/** Configure les mocks de tx avec des valeurs par défaut correctes */
function setupDefaultTx(updatedProf = makeProfDB()) {
  mockTx.cvSnapshot.findFirst.mockResolvedValue(null);  // première version
  mockTx.cvSnapshot.create.mockResolvedValue({});
  mockTx.professor.update.mockResolvedValue({});
  mockTx.experience.deleteMany.mockResolvedValue({});
  mockTx.experience.createMany.mockResolvedValue({});
  mockTx.formation.deleteMany.mockResolvedValue({});
  mockTx.formation.createMany.mockResolvedValue({});
  mockTx.professorSkill.deleteMany.mockResolvedValue({});
  mockTx.professorSkill.create.mockResolvedValue({});
  mockTx.skill.findUnique.mockResolvedValue({ id: "sk-1", nom: "Python" });
  mockTx.cvExtraction.updateMany.mockResolvedValue({ count: 0 });
  mockTx.auditLog.create.mockResolvedValue({});
  mockTx.professor.findUnique.mockResolvedValue(updatedProf);
  mockPrisma.$transaction.mockImplementation(async (cb) => cb(mockTx));
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("POST /api/professor/cvs — auth guards", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 when not authenticated", async () => {
    mockRequireRole.mockResolvedValue({
      error: NextResponse.json({ success: false, message: "Non authentifié." }, { status: 401 }),
    });
    const res = await POST(makeReq());
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.success).toBe(false);
  });

  it("returns 403 when role is not PROFESSEUR", async () => {
    mockRequireRole.mockResolvedValue({
      error: NextResponse.json({ success: false, message: "Accès refusé." }, { status: 403 }),
    });
    const res = await POST(makeReq());
    expect(res.status).toBe(403);
  });
});

describe("POST /api/professor/cvs — validation", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 404 when professor profile is missing", async () => {
    mockRequireRole.mockResolvedValue({ session: sessionFor() });
    mockPrisma.professor.findUnique.mockResolvedValue(null);

    const res = await POST(makeReq({ profile: { ville: "Ottawa" } }));
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.message).toMatch(/introuvable/i);
  });
});

describe("POST /api/professor/cvs — success paths", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireRole.mockResolvedValue({ session: sessionFor() });
    mockPrisma.professor.findUnique.mockResolvedValue(makeProfDB());
  });

  it("returns 200 with normalized data on profile-only update", async () => {
    setupDefaultTx();

    const res = await POST(makeReq({ profile: { telephone: "613-000-0000", ville: "Gatineau" } }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.normalized).toBe(true);
  });

  it("creates snapshot with version 1 on first save (no previous snapshot)", async () => {
    setupDefaultTx();

    await POST(makeReq({ profile: { ville: "Ottawa" } }));

    expect(mockTx.cvSnapshot.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ version: 1, professorId: "prof-1" }),
      }),
    );
  });

  it("creates snapshot with version n+1 when previous snapshot exists", async () => {
    setupDefaultTx();
    mockTx.cvSnapshot.findFirst.mockResolvedValue({ version: 4 });

    await POST(makeReq({ profile: { ville: "Ottawa" } }));

    expect(mockTx.cvSnapshot.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ version: 5 }),
      }),
    );
  });

  it("uses snapshotLabel when provided", async () => {
    setupDefaultTx();

    await POST(makeReq({ profile: {}, snapshotLabel: "Import depuis PDF" }));

    expect(mockTx.cvSnapshot.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ label: "Import depuis PDF" }),
      }),
    );
  });

  it("defaults snapshot label to 'Modification manuelle' when absent", async () => {
    setupDefaultTx();

    await POST(makeReq({ profile: {} }));

    expect(mockTx.cvSnapshot.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ label: "Modification manuelle" }),
      }),
    );
  });

  it("deletes then re-creates experiences when provided", async () => {
    setupDefaultTx();
    const exps = [{ poste: "Dev", entreprise: "ACME", debut: "2020-01", fin: null, description: "" }];

    await POST(makeReq({ experiences: exps }));

    expect(mockTx.experience.deleteMany).toHaveBeenCalledWith({ where: { professorId: "prof-1" } });
    expect(mockTx.experience.createMany).toHaveBeenCalled();
  });

  it("skips experience deleteMany when experiences not in payload", async () => {
    setupDefaultTx();

    await POST(makeReq({ profile: { ville: "Ottawa" } }));

    expect(mockTx.experience.deleteMany).not.toHaveBeenCalled();
  });

  it("deletes then re-creates formations when provided", async () => {
    setupDefaultTx();
    const forms = [{ diplome: "BAC", niveauDiplome: "BACHELORS", etablissement: "U Ottawa", anneeObtention: "2019" }];

    await POST(makeReq({ formations: forms }));

    expect(mockTx.formation.deleteMany).toHaveBeenCalledWith({ where: { professorId: "prof-1" } });
    expect(mockTx.formation.createMany).toHaveBeenCalled();
  });

  it("upserts skill and links professor when competences provided", async () => {
    setupDefaultTx();
    const comps = [{ nom: "Python", niveau: "AVANCE", categorie: "IA", anneesExp: 3, source: "SAISIE_MANUELLE" }];

    await POST(makeReq({ competences: comps }));

    expect(mockTx.professorSkill.deleteMany).toHaveBeenCalledWith({ where: { professorId: "prof-1" } });
    expect(mockTx.skill.findUnique).toHaveBeenCalledWith({ where: { nom: "Python" } });
    expect(mockTx.professorSkill.create).toHaveBeenCalled();
  });

  it("creates a new skill when it does not exist yet", async () => {
    setupDefaultTx();
    mockTx.skill.findUnique.mockResolvedValue(null); // skill introuvable
    const newSkill = { id: "sk-new", nom: "Rust" };
    // Simulate skill creation — route calls tx.skill.create when findUnique returns null
    // We need to add a create mock on the tx for skill
    mockTx.skill.create = vi.fn().mockResolvedValue(newSkill);

    await POST(makeReq({ competences: [{ nom: "Rust", niveau: "DEBUTANT" }] }));

    expect(mockTx.skill.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ nom: "Rust" }) }),
    );
  });
});

describe("POST /api/professor/cvs — error handling", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireRole.mockResolvedValue({ session: sessionFor() });
    mockPrisma.professor.findUnique.mockResolvedValue(makeProfDB());
  });

  it("returns 500 when the transaction throws", async () => {
    mockPrisma.$transaction.mockRejectedValue(new Error("Erreur DB"));

    const res = await POST(makeReq({ profile: { ville: "Ottawa" } }));
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.message).toMatch(/erreur db/i);
  });
});
