/**
 * @module components/professeur/skills/ConfidenceBar
 * @description Barre indiquant le niveau de confiance (%) d'une donnée extraite par l'IA.
 */

/**
 * Barre de confiance colorée selon le pourcentage.
 * @param {Object} props
 * @param {number} props.confidence - Score de confiance (0-100).
 * @returns {JSX.Element} La barre de confiance.
 */
export default function ConfidenceBar({ confidence }) {
  const color = confidence >= 90 ? "bg-emerald-400" : confidence >= 70 ? "bg-amber-400" : "bg-red-400";
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${confidence}%` }} />
      </div>
      <span className="text-[10px] font-bold text-slate-400">{confidence}%</span>
    </div>
  );
}