import { describe, it, expect } from "vitest";
import {
  fmtDate,
  normalizeAssignmentsProf,
  normalizeWeights,
  normalizeField,
} from "@/lib/formatData";

// ---------------------------------------------------------------------------
// fmtDate
// ---------------------------------------------------------------------------
describe("fmtDate", () => {
  it("returns empty string for null", () => expect(fmtDate(null)).toBe(""));
  it("returns empty string for undefined", () => expect(fmtDate(undefined)).toBe(""));
  it("returns empty string for empty string", () => expect(fmtDate("")).toBe(""));

  it("formats a date in fr-CA locale (YYYY-MM-DD)", () => {
    // Use noon UTC so the result is the same in every timezone (UTC-12 to UTC+14)
    expect(fmtDate("2024-03-15T12:00:00Z")).toBe("2024-03-15");
  });
});

// ---------------------------------------------------------------------------
// normalizeField
// ---------------------------------------------------------------------------
describe("normalizeField", () => {
  it("detects JSON array", () => {
    const f = normalizeField({ label: "competences", value: '["JS","Python"]' });
    expect(f.type).toBe("array");
    expect(f.parsedValue).toEqual(["JS", "Python"]);
  });

  it("detects JSON object", () => {
    const f = normalizeField({ label: "meta", value: '{"key":"val"}' });
    expect(f.type).toBe("object");
    expect(f.parsedValue).toEqual({ key: "val" });
  });

  it("detects number", () => {
    const f = normalizeField({ value: "42" });
    expect(f.type).toBe("number");
    expect(f.parsedValue).toBe(42);
  });

  it("detects boolean true", () => {
    const f = normalizeField({ value: "true" });
    expect(f.type).toBe("boolean");
    expect(f.parsedValue).toBe(true);
  });

  it("detects boolean false", () => {
    const f = normalizeField({ value: "FALSE" });
    expect(f.type).toBe("boolean");
    expect(f.parsedValue).toBe(false);
  });

  it("falls back to text for plain string", () => {
    const f = normalizeField({ value: "Ottawa" });
    expect(f.type).toBe("text");
    expect(f.parsedValue).toBe("Ottawa");
  });

  it("returns text when value is not a string", () => {
    const f = normalizeField({ value: 123 });
    expect(f.type).toBe("text");
    expect(f.parsedValue).toBe(123);
  });
});

// ---------------------------------------------------------------------------
// normalizeAssignmentsProf
// ---------------------------------------------------------------------------
describe("normalizeAssignmentsProf", () => {
  it("returns empty array for empty input", () => {
    expect(normalizeAssignmentsProf([])).toEqual([]);
  });

  const flat = [
    {
      sessionId: "s1",
      sessionNom: "Session Hiver",
      sessionStatut: "ACTIVE",
      statut: "CONFIRME",
      score: 85,
      cours: { code: "INF101", nom: "Intro Informatique", etape: 1, programmes: [{ code: "BACS" }] },
    },
    {
      sessionId: "s1",
      sessionNom: "Session Hiver",
      sessionStatut: "ACTIVE",
      statut: "PROPOSE",
      score: 70,
      cours: { code: "INF102", nom: "Algorithmique", etape: 2, programmes: [] },
    },
    {
      sessionId: "s2",
      sessionNom: "Session Été",
      sessionStatut: "FERMEE",
      statut: "CONFIRME",
      score: 90,
      cours: { code: "INF201", nom: "Bases de données", etape: 1, programmes: [{ code: "BACS" }] },
    },
  ];

  it("groups assignments into sessions", () => {
    const result = normalizeAssignmentsProf(flat);
    expect(result).toHaveLength(2);
  });

  it("attaches correct session metadata", () => {
    const result = normalizeAssignmentsProf(flat);
    const s1 = result.find((s) => s.id === "s1");
    expect(s1.nom).toBe("Session Hiver");
    expect(s1.statut).toBe("ACTIVE");
  });

  it("maps cours correctly", () => {
    const result = normalizeAssignmentsProf(flat);
    const s1 = result.find((s) => s.id === "s1");
    expect(s1.cours).toHaveLength(2);
    expect(s1.cours[0]).toEqual({
      code: "INF101",
      nom: "Intro Informatique",
      programme: "BACS",
      etape: 1,
      statut: "CONFIRME",
      score: 85,
    });
  });

  it("falls back to — when programmes array is empty", () => {
    const result = normalizeAssignmentsProf(flat);
    const s1 = result.find((s) => s.id === "s1");
    expect(s1.cours[1].programme).toBe("—");
  });

  it("falls back to — when programmes is null/undefined", () => {
    const input = [{
      sessionId: "sx", sessionNom: "X", sessionStatut: "ACTIVE",
      statut: "PROPOSE", score: 0,
      cours: { code: "Y", nom: "Z", etape: null, programmes: null },
    }];
    expect(normalizeAssignmentsProf(input)[0].cours[0].programme).toBe("—");
  });

  it("preserves the order of sessions (insertion order)", () => {
    const result = normalizeAssignmentsProf(flat);
    expect(result[0].id).toBe("s1");
    expect(result[1].id).toBe("s2");
  });
});

// ---------------------------------------------------------------------------
// normalizeWeights
// ---------------------------------------------------------------------------
describe("normalizeWeights", () => {
  it("returns empty array for empty input", () => {
    expect(normalizeWeights([])).toEqual([]);
  });

  const base = { id: "s1", nom: "Session Hiver", annee: 2024, periode: "hiver", statut: "active" };

  it("applies default percentages when fields are null", () => {
    const result = normalizeWeights([{
      session: base,
      competencesPct: null, experiencePct: null, formationPct: null, historiquePct: null,
    }]);
    expect(result[0].competencesPct).toBe(40);
    expect(result[0].experiencePct).toBe(25);
    expect(result[0].formationPct).toBe(20);
    expect(result[0].historiquePct).toBe(15);
  });

  it("marks isValid=true when total equals 100", () => {
    const result = normalizeWeights([{
      session: base,
      competencesPct: 40, experiencePct: 25, formationPct: 20, historiquePct: 15,
    }]);
    expect(result[0].total).toBe(100);
    expect(result[0].isValid).toBe(true);
  });

  it("marks isValid=false when total != 100", () => {
    const result = normalizeWeights([{
      session: base,
      competencesPct: 50, experiencePct: 30, formationPct: 20, historiquePct: 20,
    }]);
    expect(result[0].total).toBe(120);
    expect(result[0].isValid).toBe(false);
  });

  it("uppercases session, periode, and statut", () => {
    const result = normalizeWeights([{
      session: base,
      competencesPct: 40, experiencePct: 25, formationPct: 20, historiquePct: 15,
    }]);
    expect(result[0].session).toBe("SESSION HIVER");
    expect(result[0].periode).toBe("HIVER");
    expect(result[0].statut).toBe("ACTIVE");
  });

  it("handles null periode and statut gracefully", () => {
    const result = normalizeWeights([{
      session: { id: "s2", nom: "Test", annee: null, periode: null, statut: null },
      competencesPct: 40, experiencePct: 25, formationPct: 20, historiquePct: 15,
    }]);
    expect(result[0].periode).toBeNull();
    expect(result[0].statut).toBeNull();
  });

  it("deduplicates by sessionId (last one wins)", () => {
    const result = normalizeWeights([
      { session: base, competencesPct: 40, experiencePct: 25, formationPct: 20, historiquePct: 15 },
      { session: base, competencesPct: 60, experiencePct: 20, formationPct: 10, historiquePct: 10 },
    ]);
    expect(result).toHaveLength(1);
    expect(result[0].competencesPct).toBe(60);
  });
});
