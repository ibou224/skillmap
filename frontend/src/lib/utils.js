import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const scoreBarColor  = (v) => v >= 75 ? "bg-emerald-500"   : v >= 50 ? "bg-amber-500"   : "bg-red-400";
export const scoreTextColor = (v) => v >= 75 ? "text-emerald-600" : v >= 50 ? "text-amber-600" : "text-red-500";

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
