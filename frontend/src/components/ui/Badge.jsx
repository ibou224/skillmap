/**
 * @module components/ui/Badge
 * @description Badges réutilisables : badge générique et badge de statut coloré
 * basé sur la table de styles STATUT.
 */

import { STATUT } from "@/constants/constantes";

/**
 * Badge générique (pastille d'étiquette).
 * @param {Object} props
 * @param {React.ReactNode} props.children - Contenu du badge.
 * @param {string} [props.className] - Classes CSS additionnelles.
 * @returns {JSX.Element} Le badge.
 */
export function Badge({ children, className = "" }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium border border-slate-200 bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 ${className}`}>
      {children}
    </span>
  );
}

/**
 * Badge de statut coloré (avec pastille) selon la valeur de statut.
 * @param {Object} props
 * @param {string} props.statut - Clé de statut (ex. PROPOSEE, AJUSTEE, FINALISEE).
 * @returns {JSX.Element} Le badge de statut.
 */
export function StatusBadge({ statut }) {
  const s = STATUT[statut] ?? STATUT.PROPOSEE;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border ${s.badge} ${s.darkBadge}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}