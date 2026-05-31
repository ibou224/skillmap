/**
 * @module features/weights/ScoreFormula
 * @description Affiche la formule de calcul du score pondéré à partir des poids courants.
 */

import { Scale } from "lucide-react";

/**
 * Carte explicative de la formule de score.
 * @param {Object} props
 * @param {Object} props.weights - Pondérations courantes par critère.
 * @returns {JSX.Element} La carte de formule.
 */
export function ScoreFormula({ weights }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
        <Scale className="w-4 h-4 text-slate-500" />
        Formule de calcul du score
      </h3>
      <div className="bg-slate-50 rounded-xl p-4">
        <p className="text-sm text-slate-600 font-mono">
          Score = (
          <span className="text-blue-600 font-bold">{weights.competencesPct}%</span> × Compétences +
          <span className="text-emerald-600 font-bold"> {weights.experiencePct}%</span> × Expérience +
          <span className="text-purple-600 font-bold"> {weights.formationPct}%</span> × Formation +
          <span className="text-amber-600 font-bold"> {weights.historiquePct}%</span> × Historique
          ) / 100
        </p>
      </div>
    </div>
  );
}