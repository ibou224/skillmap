/**
 * @module components/cv/StatCard
 * @description Carte de statistique (icône colorée + valeur + libellé).
 */

/**
 * Carte de statistique.
 * @param {Object} props
 * @param {React.ComponentType} props.icon - Composant icône (Lucide).
 * @param {string} props.label - Libellé de la statistique.
 * @param {string|number} props.value - Valeur affichée.
 * @param {string} props.colorIcon - Classe de couleur de l'icône.
 * @param {string} props.colorBg - Classe de couleur de fond de l'icône.
 * @returns {JSX.Element} La carte de statistique.
 */
export default function StatCard({ icon: Icon, label, value, colorIcon, colorBg }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${colorBg}`}>
        <Icon className={`w-5 h-5 ${colorIcon}`} />
      </div>
      <div>
        <p className="text-2xl font-black text-gray-800 tabular-nums leading-tight">{value}</p>
        <p className="text-xs text-slate-500 mt-0.5">{label}</p>
      </div>
    </div>
  );
}