/**
 * @module components/rh/affectations/SessionTabs
 * @description Onglets de sélection de la session académique (RH).
 */

/**
 * Onglets de sélection de session.
 * @param {Object} props
 * @param {Array<Object>} props.sessions - Sessions disponibles.
 * @param {string} props.selected - Id de la session sélectionnée.
 * @param {Function} props.onChange - Callback de changement de session.
 * @returns {JSX.Element} Les onglets de session.
 */
export default function SessionTabs({ sessions, selected, onChange }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm px-6 py-4">
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
        Session académique
      </p>
      <div className="flex gap-2 flex-wrap">
        {sessions.map((s) => (
          <button
            key={s.id}
            onClick={() => onChange(s.id)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              selected === s.id
                ? "bg-cite-green text-white shadow-sm"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {s.nom}
            {s.statut === "ACTIVE" && (
              <span className="ml-2 w-1.5 h-1.5 rounded-full bg-white/80 inline-block" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
