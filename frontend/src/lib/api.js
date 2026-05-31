/**
 * @module lib/api
 * @description Petit client HTTP générique au-dessus de `fetch` pour appeler
 * les routes internes de l'application. Sérialise/désérialise le JSON et lève
 * une erreur si la réponse HTTP n'est pas dans la plage 2xx.
 */

/** URL de base des appels API, configurable via la variable d'environnement publique. */
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

/**
 * Effectue une requête HTTP et retourne le corps JSON de la réponse.
 *
 * @param {string} path                Chemin relatif de l'endpoint (ex. "/api/cours").
 * @param {Object} [options={}]        Options `fetch` (method, body, headers...).
 * @param {Object} [options.headers]   En-têtes additionnels fusionnés avec le Content-Type JSON.
 * @returns {Promise<any>}             Corps de la réponse désérialisé en JSON.
 * @throws {Error}                     Si le statut HTTP n'est pas OK (hors 2xx).
 */
async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

/**
 * Client API exposant les verbes HTTP usuels.
 *
 * @property {function(string): Promise<any>}         get  - Requête GET.
 * @property {function(string, any): Promise<any>}    post - Requête POST avec corps JSON.
 * @property {function(string, any): Promise<any>}    put  - Requête PUT avec corps JSON.
 * @property {function(string): Promise<any>}         del  - Requête DELETE.
 */
export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: "POST", body: JSON.stringify(body) }),
  put: (path, body) => request(path, { method: "PUT", body: JSON.stringify(body) }),
  del: (path) => request(path, { method: "DELETE" }),
};
