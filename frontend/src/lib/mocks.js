// src/data/mocks.js

// ─────────────────────────────────────────────────────────────────────────────
// 1. ENTITÉS MÉTIER (CDC - Fonctionnalité 3 : Gestion des entités)
// ─────────────────────────────────────────────────────────────────────────────

export const MOCK_SESSIONS = [
  { id: "s1", nom: "Automne 2026", annee: 2026, periode: "A", active: true, dateDebut: "2026-08-24", dateFin: "2026-12-11" },
  { id: "s2", nom: "Hiver 2026",   annee: 2026, periode: "H", active: true, dateDebut: "2026-01-12", dateFin: "2026-05-01" },
  { id: "s3", nom: "Automne 2025", annee: 2025, periode: "A", active: false, dateDebut: "2025-08-25", dateFin: "2025-12-12" },
];

export const MOCK_PROGRAMS = [
  { id: "p1", code: "PI",  nom: "Programmation informatique", description: "DEC 420.A0" },
  { id: "p2", code: "IAI", nom: "Intelligence artificielle et informatique", description: "DEC 420.B0" },
  { id: "p3", code: "RS",  nom: "Réseaux et sécurité", description: "DEC 420.C0" },
];

export const MOCK_COURSES = [
  { id: "c1", code: "420-1A3", nom: "Programmation Web", programmeId: "p1", etape: 1, duree: 3, typeSalle: "Lab" },
  { id: "c2", code: "420-2B4", nom: "Base de données", programmeId: "p1", etape: 2, duree: 3, typeSalle: "Lab" },
  { id: "c3", code: "420-3C5", nom: "IA Appliquée", programmeId: "p2", etape: 3, duree: 4, typeSalle: "Lab" },
  { id: "c4", code: "420-4E7", nom: "Réseaux Informatiques", programmeId: "p3", etape: 4, duree: 3, typeSalle: "Lab" },
  { id: "c5", code: "420-5F8", nom: "Sécurité Informatique", programmeId: "p3", etape: 5, duree: 3, typeSalle: "Lab" },
];

export const MOCK_PROFESSORS = [
  { id: "prof1", prenom: "Jean", nom: "Dupont", email: "jean.dupont@cegep.qc.ca", competences: ["JavaScript", "React", "Node.js"], experience: 8, formation: "Maîtrise", historique: ["420-1A3", "420-2B4"] },
  { id: "prof2", prenom: "Marie", nom: "Curie", email: "marie.curie@cegep.qc.ca", competences: ["Python", "Machine Learning", "TensorFlow"], experience: 12, formation: "Doctorat", historique: ["420-3C5"] },
  { id: "prof3", prenom: "Paul", nom: "Martin", email: "paul.martin@cegep.qc.ca", competences: ["Cisco", "Sécurité", "Linux"], experience: 6, formation: "Baccalauréat", historique: [] },
  { id: "prof4", prenom: "Sophie", nom: "Lefebvre", email: "sophie.lefebvre@cegep.qc.ca", competences: ["SQL", "PostgreSQL", "MongoDB"], experience: 5, formation: "Maîtrise", historique: ["420-2B4"] },
];

// ─────────────────────────────────────────────────────────────────────────────
// 2. CONFIGURATION (CDC - Fonctionnalité 3 & 4 : Pondérations & Statuts)
// ─────────────────────────────────────────────────────────────────────────────

export const PONDERATIONS_CONFIG = {
  competences: { label: "Compétences techniques", weight: 40, min: 20, max: 60 },
  experience:  { label: "Années d'expérience",   weight: 25, min: 10, max: 40 },
  formation:   { label: "Niveau de formation",    weight: 20, min: 10, max: 35 },
  historique:  { label: "Historique d'enseignement", weight: 15, min: 0,  max: 30 }
};

export const STATUT_CONFIG = {
  PROPOSEE:  { label: "Proposée",  badge: "bg-amber-50 text-amber-700 border-amber-200", dot: "bg-amber-500", color: "text-amber-600" },
  AJUSTEE:   { label: "Ajustée",   badge: "bg-blue-50 text-blue-700 border-blue-200",     dot: "bg-blue-500",    color: "text-blue-600"    },
  FINALISEE: { label: "Finalisée", badge: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500", color: "text-emerald-600" },
};

// ─────────────────────────────────────────────────────────────────────────────
// 3. GÉNÉRATEUR DE PROPOSITIONS (CDC - Fonctionnalité 4 : Moteur d'affectation)
// ─────────────────────────────────────────────────────────────────────────────────────

/**
 * Calcule le score selon la formule officielle du CDC :
 * Score = Σ(Critère_i × Poids_i) / Σ(Poids_i) × 100
 */
function calculateScore(detail, weights) {
  const totalWeight = Object.values(weights).reduce((sum, w) => sum + w.weight, 0);
  const rawScore = (
    (detail.skills * weights.competences.weight +
     detail.experience * weights.experience.weight +
     detail.education * weights.formation.weight +
     detail.history * weights.historique.weight) / totalWeight
  );
  return parseFloat(rawScore.toFixed(1));
}

/**
 * Génère des propositions d'affectation réalistes
 * Simule la réponse de POST /api/affectations/run
 */
export function generateMockProposals(sessionId = "s1") {
  return MOCK_COURSES.map((cours, idx) => {
    const prof = MOCK_PROFESSORS[idx % MOCK_PROFESSORS.length];
    
    // Simulation des scores bruts (0-100)
    const skillsMatch = prof.competences.some(c => cours.nom.toLowerCase().includes(c.toLowerCase())) ? 92 : 65;
    const expScore = prof.experience >= 8 ? 85 : prof.experience >= 4 ? 70 : 50;
    const eduScore = prof.formation === "Doctorat" ? 95 : prof.formation === "Maîtrise" ? 85 : 75;
    const histScore = prof.historique.includes(cours.code) ? 100 : 0;

    const scoreDetail = { skills: skillsMatch, experience: expScore, education: eduScore, history: histScore };
    const score = calculateScore(scoreDetail, PONDERATIONS_CONFIG);

    // Répartition des statuts pour tester le workflow RH
    const statut = idx === 0 ? "PROPOSEE" : idx === 1 ? "AJUSTEE" : idx === 2 ? "FINALISEE" : "PROPOSEE";

    return {
      id: `prop-${sessionId}-${idx + 1}`,
      sessionId,
      cours: { id: cours.id, code: cours.code, nom: cours.nom, etape: cours.etape },
      professeur: { id: prof.id, prenom: prof.prenom, nom: prof.nom, email: prof.email },
      score,
      scoreDetail,
      statut,
      createdAt: new Date().toISOString(),
      updatedAt: statut !== "PROPOSEE" ? new Date().toISOString() : null,
      notes: statut === "AJUSTEE" ? "Ajustement RH : besoin urgent en programmation" : undefined
    };
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. HISTORIQUE (CDC - Fonctionnalité 5 : Historique et rapports)
// ─────────────────────────────────────────────────────────────────────────────

export const MOCK_HISTORIQUE = [
  {
    id: "hist-1",
    sessionId: "s3",
    sessionNom: "Automne 2025",
    totalAffectations: 5,
    finalisees: 4,
    ajusteesManuellement: 1,
    scoreMoyenFinal: 84.2,
    dateArchivage: "2025-12-15T09:00:00Z",
    archivePar: "rh-admin@cegep.qc.ca",
    urlExport: "/api/exports/affectations-s3.pdf"
  }
];

// ─────────────────────────────────────────────────────────────────────────────
// UTILISATION RAPIDE DANS TON API (Next.js App Router)
// ─────────────────────────────────────────────────────────────────────────────

/*
// app/api/affectations/run/route.js
import { NextResponse } from "next/server";
import { generateMockProposals } from "@/data/mocks";

export async function POST(req) {
  const { sessionId, ponderations } = await req.json();
  
  // TODO: Remplacer par appel FastAPI
  const proposals = generateMockProposals(sessionId);
  
  return NextResponse.json({ 
    success: true, 
    count: proposals.length,
    data: proposals,
    sessionId 
  }, { status: 201 });
}
*/