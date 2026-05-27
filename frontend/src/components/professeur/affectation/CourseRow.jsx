import { STATUT } from "@/constants/constantes";

export function CourseRow({ cours }) {
  const s = STATUT[cours.statut] ?? STATUT.PROPOSEE;
  return (
    <div className="flex items-center justify-between px-4 py-3 hover:bg-slate-50/60 transition-colors">
      <div className="flex items-center gap-3 min-w-0">
        <span className="text-xs font-mono text-slate-400 shrink-0">{cours.code}</span>
        <span className="text-sm font-medium text-slate-700 truncate">{cours.nom}</span>
        {cours.etape && (
          <span className="hidden sm:inline text-[10px] font-semibold px-2 py-0.5 rounded-full bg-violet-50 text-violet-600 shrink-0">
            Étape {cours.etape}
          </span>
        )}
        <span className="hidden sm:inline text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 shrink-0">
          {cours.programme}
        </span>
      </div>
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border shrink-0 ${s.badge}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
        {s.label}
      </span>
    </div>
  );
}
