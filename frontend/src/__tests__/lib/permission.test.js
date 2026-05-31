import { describe, it, expect, vi, beforeEach } from "vitest";

const mockAuth = vi.hoisted(() => vi.fn());

vi.mock("@/lib/auth", () => ({ auth: mockAuth }));

import { requireRole } from "@/lib/permission";

describe("requireRole", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 when auth() returns null", async () => {
    mockAuth.mockResolvedValue(null);
    const { error, session } = await requireRole("ADMIN");
    expect(session).toBeUndefined();
    expect(error).toBeDefined();
    expect(error.status).toBe(401);
    const body = await error.json();
    expect(body.success).toBe(false);
    expect(body.message).toMatch(/authentification/i);
  });

  it("returns 401 when session has no user", async () => {
    mockAuth.mockResolvedValue({ user: null });
    const { error } = await requireRole("ADMIN");
    expect(error.status).toBe(401);
  });

  it("returns 403 when user role is not in allowed list", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u1", role: "PROFESSEUR" } });
    const { error, session } = await requireRole("ADMIN", "RH");
    expect(session).toBeUndefined();
    expect(error.status).toBe(403);
    const body = await error.json();
    expect(body.success).toBe(false);
    expect(body.message).toMatch(/acc[eè]s/i);
  });

  it("returns session when role is authorized", async () => {
    const mockSession = { user: { id: "u1", role: "ADMIN" } };
    mockAuth.mockResolvedValue(mockSession);
    const { session, error } = await requireRole("ADMIN", "RH");
    expect(error).toBeUndefined();
    expect(session).toBe(mockSession);
  });

  it("accepts any role from a multi-role list", async () => {
    for (const role of ["ADMIN", "RH", "PROFESSEUR"]) {
      mockAuth.mockResolvedValue({ user: { id: "u1", role } });
      const { session } = await requireRole("ADMIN", "RH", "PROFESSEUR");
      expect(session).toBeDefined();
    }
  });

  it("returns 403 for unknown role", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u1", role: "SUPERUSER" } });
    const { error } = await requireRole("ADMIN");
    expect(error.status).toBe(403);
  });
});
