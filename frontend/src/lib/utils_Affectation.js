import { MOCK_COURSES, MOCK_PROFESSORS } from "./constants-Affectation";

// ── Helpers CSS ───────────────────────────────────────────────────────────────
export const cn = (...cls) => cls.filter(Boolean).join(" ");

export const scoreBarColor  = (v) => v >= 75 ? "bg-emerald-500"   : v >= 50 ? "bg-amber-500"   : "bg-red-400";
export const scoreTextColor = (v) => v >= 75 ? "text-emerald-600" : v >= 50 ? "text-amber-600" : "text-red-500";

// ── Formule pondérée — CDC section 2.2 / Fonctionnalité 4 ───────────────────
// Score = Σ(Critère × Poids) / Σ(Poids) × 100
export const calcWeightedScore = (detail, weights) => {
  const total = Object.values(weights).reduce((s, w) => s + w.weight, 0);
  if (total === 0) return 0;
  return parseFloat((
    (detail.skills     * weights.competences.weight +
     detail.experience * weights.experience.weight  +
     detail.education  * weights.formation.weight   +
     detail.history    * weights.historique.weight) / total
  ).toFixed(1));
};

// ── Génération des propositions mockées ─────────────────────────────────────
export const generateProposals = (weights) =>
  MOCK_COURSES.map((cours, idx) => {
    const prof   = MOCK_PROFESSORS[idx % MOCK_PROFESSORS.length];
    const skills = prof.competences.some((c) =>
      cours.nom.toLowerCase().includes(c.toLowerCase())
    ) ? 90 : 60;
    const exp    = prof.experience >= 5 ? 85 : 50;
    const edu    = prof.formation === "Doctorat" ? 95 : prof.formation === "Maîtrise" ? 85 : 70;
    const hist   = prof.historique.includes(cours.code) ? 100 : 0;
    const detail = { skills, experience: exp, education: edu, history: hist };

    return {
      id:          `prop-${idx + 1}`,
      cours,
      professeur:  prof,
      score:       calcWeightedScore(detail, weights),
      scoreDetail: detail,
      statut:      idx === 3 ? "FINALISEE" : idx === 1 ? "AJUSTEE" : "PROPOSEE",
    };
  });
