import { LABEL_MAPPING } from "@/constants/constantes";

/**
 * @brief Analyse un champ extrait et détermine son type de données réel.
 * 
 * Cette fonction prend un objet contenant une valeur brute (généralement une chaîne de caractères),
 * tente de la convertir vers son type logique (tableau JSON, objet JSON, nombre ou booléen),
 * et retourne un nouvel objet enrichi avec le type détecté et la valeur convertie.
 * 
 * @param {Object} field L'objet représentant le champ extrait.
 * @param {string} [field.label] L'étiquette ou l'identifiant du champ (optionnel).
 * @param {string|any} field.value La valeur brute à analyser et à normaliser.
 * @param {number} [field.confidence] Le score de confiance de l'extraction (optionnel).
 * 
 * @returns {Object} Le champ original enrichi des nouvelles propriétés :
 * - `type` {string} : Le type détecté ("array", "object", "number", "boolean", ou "text").
 * - `parsedValue` {any} : La valeur convertie dans son type réel.
 * - `value` {string|any} : La valeur brute d'origine conservée intacte.
 */
export const normalizeField = (field) => {
  if (typeof field.value === "string") {
    const trimmed = field.value.trim();

    // 1. Détection JSON (Tableau ou Objet)
    if (trimmed.startsWith("[") || trimmed.startsWith("{")) {
      try {
        const parsed = JSON.parse(field.value);
        if (Array.isArray(parsed)) {
          return { 
            ...field, 
            type: "array", 
            parsedValue: parsed, 
            value: field.value 
        };
        } else if (typeof parsed === "object" && parsed !== null) {
          return { 
            ...field, 
            type: "object", 
            parsedValue: parsed, 
            value: field.value };
        }
      } catch {}
      
    }
    // 2. Détection de nombre (Sorti du bloc JSON)
    if (!isNaN(trimmed) && trimmed !== "") {
      return { 
        ...field, 
        type: "number", 
        parsedValue: parseFloat(trimmed) 
      };
    }

    const lower = trimmed.toLowerCase();
    if (lower === "true" || lower === "false") {
      return {
        ...field, 
        type: "boolean", 
        parsedValue: lower === "true" 
        };
    }
  }
  return {
    ...field,
    type: "text",
    parsedValue: field.value,
  };
}

export function buildStructuredData(fieldsArray) {
  const result = {
    prenom: "",
    nom: "",
    email: "",
    telephone: "",
    ville: "",
    siteWeb: "",
    linkedin: "",
    resume: "",
    competences: [],   
    langues: [], 
    experiences: [],
    formations: [], 
  };

  fieldsArray.forEach((field) => {
    const label = field.label.toLowerCase().trim();
    const key = LABEL_MAPPING[label] || label;

    if (key === "experiences" || key === "formations" || key === "competences" || key === "langues") {
      if (field.type === "array" && Array.isArray(field.parsedValue)) {
        result[key] = field.parsedValue;
      } else {
        try {
          const parsed = JSON.parse(field.value);
          result[key] = Array.isArray(parsed) ? parsed : [];
        } catch {
          result[key] = [];
        }
      }
    } else {
      result[key] = field.parsedValue ?? field.value;
    }
  });

  result.experiences = result.experiences.map((exp, index) => ({
    id: exp.id || index + 1,
    ...exp,
  }));
 result.formations = result.formations.map((form, index) => ({
  id: form.id || index + 1,
  diplome: form.diplome || "",
  etablissement: form.etablissement || "",
  anneeObtention: form.anneeObtention || form.annee || "",
}));

  return result;
}

export function fmtDate(str, opts) {
  if (!str) return "";
  return new Date(str).toLocaleDateString("fr-CA", opts);
}

/**
 * Normalise les affectations en sessions avec cours
 * @param {Array} assignments - Affectations brutes de Prisma
 * @returns {Array} Sessions normalisées
 */
export function normalizeAssignments(assignments) {
  const sessionsMap = new Map();

  assignments.forEach(assignment => {
    const { session, course, professor, statut, score } = assignment;
    const sessionId = session.id;

    if (!sessionsMap.has(sessionId)) {
      sessionsMap.set(sessionId, {
        id: session.id,
        nom: session.nom,
        annee: session.annee,
        periode: session.periode,
        statut: session.statut,
        dateDebut: formatDate(session.dateDebut),
        dateFin: formatDate(session.dateFin),
        cours: []
      });
    }

    sessionsMap.get(sessionId).cours.push({
      code: course.code,
      nom: course.nom,
      programmes: course.programs ?? [],
      etape: course.etape,
      statut,
      score,
      professeur: {
        id: professor.id,
        nom: professor.user.nom,
        prenom: professor.user.prenom,
        email: professor.user.email,
      }
    });
  });

  return Array.from(sessionsMap.values());
}

function formatDate(date) {
  if (!date) return null;
  return new Date(date).toISOString().split('T')[0];
}

/**
 * Groupe les cours par session
 */
export const groupBySession = (courses) => {
  return courses.reduce((acc, course) => {
    const sessionKey = course.sessionId;
    if (!acc[sessionKey]) {
      acc[sessionKey] = [];
    }
    acc[sessionKey].push(course);
    return acc;
  }, {});
}

export const normalizeInfosProfessor = (infos) => {
  const { user, skills, experiences, formations, telephone, ville, siteWeb, linkedIn, resume } = infos;

  return {
    prenom: user.prenom,
    nom: user.nom,
    email: user.email,
    telephone: telephone ?? "",
    ville: ville || "Ottawa, ON",
    siteWeb: siteWeb || "",
    linkedin: linkedIn || "",
    resume: resume || "",
    competences: skills.map((s) => s.skill.nom),
    langues: [],
    experiences: experiences.map((e) => ({
      poste: e.poste,
      entreprise: e.Entreprise,
      debut: e.dateDebut ? new Date(e.dateDebut).toISOString().slice(0, 7) : "",
      fin: e.dateFin ? new Date(e.dateFin).toISOString().slice(0, 7) : "",
      description: e.description ?? "",
    })),
    formations: formations.map((f) => ({
      diplome: f.diplome,
      etablissement: f.etablissement,
      anneeObtention: String(f.anneeObtention),
    })),
  };
}

export const normalizeWeights = (weights) => {
  const sessionWeights = new Map();

  weights.forEach(w => {
    const sessionId = w.session.id;
    
    sessionWeights.set(sessionId, {
      sessionId,
      session: w.session.nom.toUpperCase(),
      annee: w.session.annee,
      periode: w.session.periode.toUpperCase(),
      statut: w.session.statut.toUpperCase(),
      competencesPct: w.competencesPct ?? 40,
      experiencePct: w.experiencePct ?? 25,
      formationPct: w.formationPct ?? 20,
      historiquePct: w.historiquePct ?? 15,
      total: (w.competencesPct ?? 40) + (w.experiencePct ?? 25) + (w.formationPct ?? 20) + (w.historiquePct ?? 15),
      isValid: ((w.competencesPct ?? 40) + (w.experiencePct ?? 25) + (w.formationPct ?? 20) + (w.historiquePct ?? 15)) === 100,
    });
  });

  return Array.from(sessionWeights.values());
};