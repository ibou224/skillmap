/**
 * @module components/ui/SectionCard
 * @description Carte de section avec titre, pastille colorée et contenu.
 */

/**
 * Carte conteneur d'une section avec en-tête.
 * @param {Object} props
 * @param {string} props.title - Titre de la section.
 * @param {string} [props.dotColor='bg-emerald-400'] - Classe de couleur de la pastille.
 * @param {React.ReactNode} props.children - Contenu de la carte.
 * @returns {JSX.Element} La carte de section.
 */
export default function SectionCard({ title, dotColor = "bg-emerald-400", children }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
      <div className="flex items-center gap-2 mb-5">
        <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
        <h2 className="text-[11px] font-medium uppercase tracking-widest text-slate-400">{title}</h2>
      </div>
      {children}
    </div>
  );
}