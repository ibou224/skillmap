/**
 * @module lib/jobStore
 * @description Stockage en mémoire des jobs d'analyse d'affectations.
 *
 * Utilise globalThis pour survivre aux hot-reloads Next.js en développement.
 *
 * ⚠️  Ce store est en mémoire — les jobs sont perdus au redémarrage du serveur.
 *     Pour un déploiement multi-instance, migrer vers Redis ou une table DB.
 */

const EXPIRY_MS = 30 * 60 * 1000; // 30 minutes

const g = globalThis;
if (!g.__skillmap_analysis_jobs) {
  g.__skillmap_analysis_jobs = new Map();
}

/** @type {Map<string, AnalysisJob>} */
export const jobStore = g.__skillmap_analysis_jobs;

/**
 * @typedef {Object} AnalysisJob
 * @property {string}   id
 * @property {"PENDING"|"RUNNING"|"DONE"|"ERROR"} status
 * @property {string}   step         Description de l'étape courante
 * @property {number}   stepIndex    Index 0-based de l'étape courante
 * @property {number}   stepTotal    Nombre total d'étapes
 * @property {any[]|null} data       Propositions générées (quand DONE)
 * @property {string|null} error     Message d'erreur (quand ERROR)
 * @property {number}   createdAt    Timestamp ms
 * @property {number|null} completedAt
 */

/**
 * Crée un nouveau job en état PENDING et programme son expiration.
 * @param {string} id - UUID du job
 * @returns {AnalysisJob}
 */
export function createJob(id) {
  const job = {
    id,
    status:      "PENDING",
    step:        "Initialisation...",
    stepIndex:   0,
    stepTotal:   7,
    data:        null,
    error:       null,
    createdAt:   Date.now(),
    completedAt: null,
  };
  jobStore.set(id, job);
  // Nettoyage automatique pour éviter les fuites mémoire
  setTimeout(() => jobStore.delete(id), EXPIRY_MS);
  return job;
}

/**
 * Met à jour les champs d'un job existant.
 * @param {string} id
 * @param {Partial<AnalysisJob>} patch
 */
export function updateJob(id, patch) {
  const job = jobStore.get(id);
  if (job) Object.assign(job, patch);
}
