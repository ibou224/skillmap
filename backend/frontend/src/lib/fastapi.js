// fastapi.js
// Client pour communiquer avec le service FastAPI depuis Next.js.
// Gère les appels aux endpoints IA : analyse de CV et calcul des affectations.

const FASTAPI_URL = process.env.FASTAPI_INTERNAL_URL || "http://localhost:8000";
const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY;

//  Headers communs 

const getHeaders = () => ({
  "x-internal-api-key": INTERNAL_API_KEY,
});

//  Analyse de CV 

/**
 * Envoie un fichier CV à FastAPI pour extraction via LLM.
 * @param {File} file - Fichier PDF ou Word
 * @returns {Promise<{filename: string, cv_data: object}>}
 */
export async function analyzeCV(file) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${FASTAPI_URL}/analyze-cv/`, {
    method: "POST",
    headers: getHeaders(),
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || `Erreur FastAPI : ${response.status}`);
  }

  return response.json();
}

//  Calcul des affectations  

/**
 * Lance l'algorithme d'affectation pondérée pour une session.
 * @param {string} sessionId - ID de la session académique
 * @param {Array} professors - Liste des professeurs avec compétences
 * @param {Array} courses - Liste des cours avec compétences requises
 * @param {object} weights - Pondérations {skills_weight, experience_weight, education_weight, history_weight}
 * @returns {Promise<{session_id: string, total_proposals: number, assignments: Array}>}
 */
export async function calculateAssignments(sessionId, professors, courses, weights) {
  const response = await fetch(`${FASTAPI_URL}/calculate-assignments/`, {
    method: "POST",
    headers: {
      ...getHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      session_id: sessionId,
      professors,
      courses,
      skills_weight: weights.skills_weight ?? 0.40,
      experience_weight: weights.experience_weight ?? 0.25,
      education_weight: weights.education_weight ?? 0.20,
      history_weight: weights.history_weight ?? 0.15,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || `Erreur FastAPI : ${response.status}`);
  }

  return response.json();
}