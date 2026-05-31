/**
 * @module components/cv/MiniCount
 * @description Petite pastille « icône + compteur » (masquée si la valeur est 0).
 */

/**
 * Pastille compteur compacte.
 * @param {Object} props
 * @param {React.ComponentType} props.icon - Composant icône (Lucide).
 * @param {number} props.value - Valeur affichée (rien si 0).
 * @param {string} props.color - Classes de couleur de la pastille.
 * @returns {JSX.Element|null} La pastille, ou null si valeur nulle.
 */
export default function MiniCount({ icon: Icon, value, color }) {
  if (value === 0) return null;
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${color}`}>
      <Icon className="w-3 h-3" /> {value}
    </span>
  );
}