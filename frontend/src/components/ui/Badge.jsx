import { STATUT } from "@/constants/constantes";

export function Badge({ children, className = "" }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium border border-slate-200 bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 ${className}`}>
      {children}
    </span>
  );
}

export function StatusBadge({ statut }) {
  const s = STATUT[statut] ?? STATUT.PROPOSEE;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border ${s.badge} ${s.darkBadge}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}