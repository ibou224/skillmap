/**
 * @module components/professeur/StatCard
 * @description Carte de statistique du tableau de bord professeur (palette de couleurs prédéfinie).
 */

/**
 * Carte de statistique colorée.
 * @param {Object} props
 * @param {React.ComponentType} props.icon - Composant icône (Lucide).
 * @param {string} props.label - Libellé de la statistique.
 * @param {string|number} props.value - Valeur affichée.
 * @param {"emerald"|"blue"|"purple"|"amber"} props.color - Couleur de la carte.
 * @returns {JSX.Element} La carte de statistique.
 */
export function StatCard({ icon: Icon, label, value, color }) {
  const colors = {
    emerald: { bg: "bg-emerald-50", text: "text-emerald-600" },
    blue:    { bg: "bg-blue-50",    text: "text-blue-600" },
    purple:  { bg: "bg-purple-50",  text: "text-purple-600" },
    amber:   { bg: "bg-amber-50",   text: "text-amber-600" },
  };
  const c = colors[color] || colors.emerald;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm flex items-center gap-4">
      <div className={`w-10 h-10 rounded-xl ${c.bg} flex items-center justify-center`}>
        <Icon className={`w-5 h-5 ${c.text}`} />
      </div>
      <div>
        <p className="text-2xl font-black text-gray-800">{value}</p>
        <p className="text-xs text-slate-500">{label}</p>
      </div>
    </div>
  );
}