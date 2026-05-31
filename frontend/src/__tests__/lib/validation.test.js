import { describe, it, expect } from "vitest";
import {
  isValidEmail,
  isValidPassword,
  isValidString,
  isValidFile,
  isValidateWeights,
  WEIGHT_BOUNDS,
} from "@/lib/validation";

// ---------------------------------------------------------------------------
// isValidEmail
// ---------------------------------------------------------------------------
describe("isValidEmail", () => {
  it("accepts a valid @lacitec.on.ca address", () => {
    expect(isValidEmail("alice.tremblay@lacitec.on.ca").valid).toBe(true);
  });

  it("rejects empty string", () => {
    expect(isValidEmail("").valid).toBe(false);
  });

  it("rejects address without @", () => {
    expect(isValidEmail("alicelasite.on.ca").valid).toBe(false);
  });

  it("rejects valid format with wrong domain", () => {
    expect(isValidEmail("alice@gmail.com").valid).toBe(false);
  });

  it("rejects address missing TLD", () => {
    expect(isValidEmail("alice@lacitec").valid).toBe(false);
  });

  it("is case-insensitive on the domain check", () => {
    expect(isValidEmail("BOB@LACITEC.ON.CA").valid).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// isValidPassword
// ---------------------------------------------------------------------------
describe("isValidPassword", () => {
  const VALID_PW = "Secure@1";

  it("accepts a valid password", () => {
    expect(isValidPassword(VALID_PW).valid).toBe(true);
  });

  it("rejects empty password", () => {
    expect(isValidPassword("").valid).toBe(false);
  });

  it("rejects password shorter than 8 chars", () => {
    expect(isValidPassword("Ab@1xyz").valid).toBe(false);
  });

  it("rejects password without uppercase", () => {
    expect(isValidPassword("secure@1").valid).toBe(false);
  });

  it("rejects password without lowercase", () => {
    expect(isValidPassword("SECURE@1").valid).toBe(false);
  });

  it("rejects password without digit", () => {
    expect(isValidPassword("Secure@x").valid).toBe(false);
  });

  it("rejects password without special character", () => {
    expect(isValidPassword("Secure12").valid).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// isValidString
// ---------------------------------------------------------------------------
describe("isValidString", () => {
  it("accepts a plain alphabetic string", () => {
    expect(isValidString("Python").valid).toBe(true);
  });

  it("accepts strings with accents and hyphens", () => {
    expect(isValidString("Développement-Web").valid).toBe(true);
  });

  it("rejects empty string", () => {
    expect(isValidString("").valid).toBe(false);
  });

  it("rejects whitespace-only string", () => {
    expect(isValidString("   ").valid).toBe(false);
  });

  it("rejects string with forbidden characters (e.g. <, >)", () => {
    expect(isValidString("script<>alert").valid).toBe(false);
  });

  it("accepts string with parentheses and dots", () => {
    expect(isValidString("C++ (avancé)").valid).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// isValidFile
// ---------------------------------------------------------------------------
describe("isValidFile", () => {
  function makeFile(name, type, sizeBytes) {
    return new File([new Uint8Array(sizeBytes)], name, { type });
  }

  it("accepts a valid PDF under 5 MB", () => {
    const f = makeFile("cv.pdf", "application/pdf", 1024);
    expect(isValidFile(f).valid).toBe(true);
  });

  it("accepts a valid DOCX under 5 MB", () => {
    const f = makeFile(
      "cv.docx",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      1024,
    );
    expect(isValidFile(f).valid).toBe(true);
  });

  it("rejects a .txt file", () => {
    const f = makeFile("cv.txt", "text/plain", 500);
    expect(isValidFile(f).valid).toBe(false);
  });

  it("rejects a PDF larger than 5 MB", () => {
    const f = makeFile("big.pdf", "application/pdf", 6 * 1024 * 1024);
    const result = isValidFile(f);
    expect(result.valid).toBe(false);
    expect(result.message).toMatch(/volumineux/i);
  });

  it("rejects null", () => {
    expect(isValidFile(null).valid).toBe(false);
  });

  it("rejects undefined", () => {
    expect(isValidFile(undefined).valid).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// WEIGHT_BOUNDS
// ---------------------------------------------------------------------------
describe("WEIGHT_BOUNDS", () => {
  it("defines bounds for all four criteria", () => {
    expect(WEIGHT_BOUNDS).toHaveProperty("competencesPct");
    expect(WEIGHT_BOUNDS).toHaveProperty("experiencePct");
    expect(WEIGHT_BOUNDS).toHaveProperty("formationPct");
    expect(WEIGHT_BOUNDS).toHaveProperty("historiquePct");
  });
});

// ---------------------------------------------------------------------------
// isValidateWeights
// ---------------------------------------------------------------------------
describe("isValidateWeights", () => {
  const VALID = { competencesPct: 40, experiencePct: 25, formationPct: 20, historiquePct: 15 };

  it("accepts valid weights that sum to 100", () => {
    expect(isValidateWeights(VALID).valid).toBe(true);
  });

  it("rejects when a field is null", () => {
    expect(isValidateWeights({ ...VALID, competencesPct: null }).valid).toBe(false);
  });

  it("rejects when a field is undefined", () => {
    expect(isValidateWeights({ ...VALID, experiencePct: undefined }).valid).toBe(false);
  });

  it("rejects when sum != 100", () => {
    const result = isValidateWeights({ competencesPct: 40, experiencePct: 30, formationPct: 20, historiquePct: 20 });
    expect(result.valid).toBe(false);
    expect(result.message).toMatch(/100/);
  });

  it("rejects competencesPct below min (20)", () => {
    const result = isValidateWeights({ competencesPct: 10, experiencePct: 35, formationPct: 30, historiquePct: 25 });
    expect(result.valid).toBe(false);
    expect(result.message).toMatch(/competencesPct/);
  });

  it("rejects competencesPct above max (80)", () => {
    const result = isValidateWeights({ competencesPct: 85, experiencePct: 5, formationPct: 5, historiquePct: 5 });
    expect(result.valid).toBe(false);
  });

  it("rejects non-integer values", () => {
    const result = isValidateWeights({ competencesPct: 40.5, experiencePct: 25, formationPct: 20, historiquePct: 14.5 });
    expect(result.valid).toBe(false);
  });

  it("accepts formationPct = 0 (min allowed)", () => {
    // Formation min is 0, so redistribute to other valid fields
    const result = isValidateWeights({ competencesPct: 55, experiencePct: 30, formationPct: 0, historiquePct: 15 });
    expect(result.valid).toBe(true);
  });
});
