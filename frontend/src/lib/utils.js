/**
 * @module lib/utils
 * @description Fonctions utilitaires partagées : fusion de classes Tailwind et
 * helpers de couleurs/calcul liés aux scores de matching.
 */

import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

/**
 * Fusionne conditionnellement des classes CSS puis résout les conflits Tailwind.
 *
 * @param {...(string|Object|Array)} inputs - Classes ou conditions au format clsx.
 * @returns {string} Chaîne de classes CSS dédupliquée.
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Retourne la classe de fond correspondant à un score (vert/ambre/rouge).
 * @param {number} v - Score sur 100.
 * @returns {string} Classe Tailwind de couleur de fond.
 */
export const scoreBarColor  = (v) => v >= 75 ? "bg-emerald-500"   : v >= 50 ? "bg-amber-500"   : "bg-red-400";

/**
 * Retourne la classe de texte correspondant à un score (vert/ambre/rouge).
 * @param {number} v - Score sur 100.
 * @returns {string} Classe Tailwind de couleur de texte.
 */
export const scoreTextColor = (v) => v >= 75 ? "text-emerald-600" : v >= 50 ? "text-amber-600" : "text-red-500";

/**
 * Calcule un score global pondéré à partir des sous-scores de matching.
 *
 * @param {Object} detail            Sous-scores individuels (0-100).
 * @param {number} detail.skills     Score de compétences.
 * @param {number} detail.experience Score d'expérience.
 * @param {number} detail.education  Score de formation.
 * @param {number} detail.history    Score d'historique.
 * @param {Object} weights           Pondérations { competences, experience, formation, historique }, chacune avec `.weight`.
 * @returns {number} Score pondéré arrondi à une décimale (0 si la somme des poids est nulle).
 */
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
