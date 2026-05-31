/**
 * @module components/professeur/skills/SkillsList
 * @description Liste d'affichage de compétences/langues sous forme de badges.
 */

/**
 * Badge coloré (sous-composant).
 * @param {Object} props
 * @param {React.ReactNode} props.children - Contenu du badge.
 * @param {"green"|"blue"} [props.variant='green'] - Variante de couleur.
 * @returns {JSX.Element} Le badge.
 */
function Badge({ children, variant = "green" }) {
  const styles = {
    green: "bg-emerald-50 text-emerald-700 border border-emerald-100",
    blue:  "bg-blue-50  text-blue-700  border border-blue-100",
  };
  return (
    <span className={`px-3 py-1 text-[11px] font-medium rounded-full tracking-wide ${styles[variant]}`}>
      {children}
    </span>
  );
}

export default function SkillsList({
  items = [],
  variant = "green",
  emptyMessage = "Aucun élément.",
}) {
  if (!items || items.length === 0) {
    return <p className="text-xs text-slate-300">{emptyMessage}</p>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item, i) => (
        <Badge key={i} variant={variant}>
          {typeof item === "string" ? item : item.nom}
        </Badge>
      ))}
    </div>
  );
}