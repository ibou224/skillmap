import { vi } from "vitest";

const prisma = {
  assignment:  { findMany: vi.fn(), findUnique: vi.fn(), updateMany: vi.fn(), update: vi.fn() },
  professor:   { findUnique: vi.fn() },
  skill:       { findMany: vi.fn(), findUnique: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() },
  session:     { findMany: vi.fn(), findUnique: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() },
  program:     { findMany: vi.fn() },
  auditLog:    { create: vi.fn() },
};

export default prisma;
