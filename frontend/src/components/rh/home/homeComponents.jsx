/**
 * @module components/rh/home/homeComponents
 * @description Briques d'affichage de l'accueil RH : carte de statistique et
 * infobulle personnalisée pour les graphiques Recharts.
 */

import { cn } from "@/lib/utils";

/**
 * Carte de statistique de l'accueil RH.
 * @param {Object} props
 * @param {React.ComponentType} props.icon - Composant icône (Lucide).
 * @param {string} props.label - Libellé de la statistique.
 * @param {string|number} props.value - Valeur affichée.
 * @param {string} [props.sub] - Sous-texte optionnel.
 * @param {string} props.color - Classe de couleur de l'icône.
 * @returns {JSX.Element} La carte de statistique.
 */
export function StatCard({ icon: Icon, label, value, sub, color }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 flex items-center gap-4">
      <div className={cn("p-3 rounded-xl shrink-0", color)}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-800 dark:text-slate-100 tabular-nums leading-tight">{value}</p>
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">{label}</p>
        {sub && <p className="text-[10px] text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

/**
 * Infobulle personnalisée pour les graphiques Recharts.
 * @param {Object} props
 * @param {boolean} props.active - Infobulle active (survol).
 * @param {Array<Object>} props.payload - Données du point survolé.
 * @param {string} props.label - Libellé de l'axe.
 * @returns {JSX.Element|null} L'infobulle, ou null si inactive.
 */
export function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 shadow-lg text-xs">
      <p className="font-semibold text-slate-700 dark:text-slate-300 mb-1.5">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-1.5 mb-0.5">
          <span className="w-2 h-2 rounded-full shrink-0" style={{ background: p.fill ?? p.color }} />
          <span className="text-slate-500">{p.name} :</span>
          <span className="font-semibold text-slate-700 dark:text-slate-300 tabular-nums">{p.value}</span>
        </div>
      ))}
    </div>
  );
}