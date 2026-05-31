/**
 * @module components/ui/BarChart
 * @description Histogramme vertical simple (barres en pourcentage de leur max).
 */

/**
 * Affiche un histogramme à barres verticales.
 * @param {Object} props
 * @param {Array<{label: string, value: number, max: number}>} props.data - Données des barres.
 * @param {string} props.color - Classe Tailwind de couleur des barres.
 * @param {string} props.ariaLabel - Libellé d'accessibilité du graphique.
 * @returns {JSX.Element} L'histogramme.
 */
export function BarChart({ data, color, ariaLabel }) {
  return (
    <div role="img" aria-label={ariaLabel} className="flex items-end gap-2 h-28 mt-4">
      {data.map((d) => {
        const pct = Math.round((d.value / d.max) * 100);
        return (
          <div key={d.label} className="flex flex-col items-center gap-1 flex-1">
            <span className="text-[10px] font-bold text-slate-400">{d.value}</span>
            <div className="w-full bg-slate-100 rounded-lg overflow-hidden flex-1 flex items-end" style={{ minHeight: 60 }}>
              <div className={`w-full rounded-lg transition-all duration-300 ${color}`} style={{ height: `${pct}%` }} />
            </div>
            <span className="text-[9px] text-slate-400 text-center leading-tight">{d.label}</span>
          </div>
        );
      })}
    </div>
  );
}