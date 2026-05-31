/**
 * @module features/weights/WeightBar
 * @description Barre de progression affichant la valeur d'une pondération.
 */

/**
 * Barre d'affichage d'une pondération.
 * @param {Object} props
 * @param {number} props.value - Valeur (%) de la pondération.
 * @param {string} props.color - Classe de couleur de la barre.
 * @param {string} [props.lightColor] - Variante claire de la couleur.
 * @returns {JSX.Element} La barre de pondération.
 */
export function WeightBar({ value, color, lightColor }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${Math.min(value, 100)}%` }}
        />
      </div>
      <span className="text-sm font-bold text-slate-600 w-10 text-right tabular-nums">
        {value}%
      </span>
    </div>
  );
}