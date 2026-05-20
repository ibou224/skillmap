import { BookOpen, Calendar, Clock, ChevronDown, ChevronUp, CheckCircle2 } from "lucide-react";
import { PERIODE } from "@/constants/constantes";
import { fmtDate } from "@/lib/formatData";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { CourseRow } from "./CourseRow";

export function SessionCard({ session, isOpen, onToggle }) {
  const p = PERIODE[session.periode] ?? PERIODE.AUTOMNE;
  const Icon = p.Icon;

  const nbFin = session.cours.filter(c => c.statut === "FINALISEE").length;
  const pct = session.cours.length ? Math.round((nbFin / session.cours.length) * 100) : 0;
  const progs = [...new Set(session.cours.map(c => c.programme))].join(", ");
  const etapes = [...new Set(session.cours.map(c => c.etape))].sort((a, b) => a - b).join(", ");

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden transition-all hover:shadow-sm">
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-4 px-6 py-5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left group"
      >
        <div className={`w-12 h-12 rounded-2xl bg-linear-to-br ${p.gradient} flex items-center justify-center flex-shrink-0 shadow-sm`}>
          <Icon className="w-5 h-5 text-white" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-base font-semibold text-slate-800 dark:text-slate-200">
              {p.label} {session.annee}
            </p>
            {session.statut === "ACTIVE" && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            )}
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2">
            <span className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <BookOpen className="w-3.5 h-3.5" /> 
              {session.cours.length} cours
            </span>
            {session.dateDebut && session.dateFin && (
              <span className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <Calendar className="w-3.5 h-3.5" />
                {fmtDate(session.dateDebut, { month: "short", day: "numeric" })}
                {" – "}
                {fmtDate(session.dateFin, { month: "short", day: "numeric", year: "numeric" })}
              </span>
            )}
            <ProgressBar pct={pct} />
          </div>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg text-[11px] font-medium">
            <Clock className="w-3 h-3" />
            {session.nom}
          </span>
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
            isOpen 
              ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400' 
              : 'text-slate-400 dark:text-slate-500 group-hover:bg-slate-100 dark:group-hover:bg-slate-800'
          }`}>
            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </div>
      </button>

      {isOpen && (
        <div className="border-t border-slate-200 dark:border-slate-800 animate-in slide-in-from-top-2 duration-200">
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-slate-200 dark:divide-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
            <div className="px-6 py-4">
              <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">Cours</p>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mt-1">{session.cours.length}</p>
            </div>
            <div className="px-6 py-4">
              <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">Programmes</p>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mt-1 truncate">{progs || "—"}</p>
            </div>
            <div className="px-6 py-4">
              <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">Étapes</p>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mt-1">{etapes || "—"}</p>
            </div>
            <div className="px-6 py-4">
              <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">Finalisés</p>
              <div className="flex items-center gap-2 mt-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                  {nbFin}/{session.cours.length}
                </p>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800">
                  {["Code", "Cours", "Programme", "Étape", "Statut"].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {session.cours.length > 0 ? (
                  session.cours.map(c => <CourseRow key={c.code} {...c} />)
                ) : (
                  <tr>
                    <td colSpan={5} className="py-12 text-center">
                      <BookOpen className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                      <p className="text-sm text-slate-400 dark:text-slate-500">Aucun cours pour cette session</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}