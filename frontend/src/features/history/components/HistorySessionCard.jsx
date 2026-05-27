"use client";

import { BookOpen, ChevronDown, ChevronUp, Mail, User } from "lucide-react";

const STATUT_STYLE = {
  PROPOSEE: "bg-blue-50 text-blue-700 border-blue-200",
  AJUSTEE: "bg-amber-50 text-amber-700 border-amber-200",
  FINALISEE: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

function formatDate(value) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("fr-CA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatScore(score) {
  if (typeof score !== "number") return "-";
  return `${score.toFixed(1)}%`;
}

export default function HistorySessionCard({ group, isOpen, onToggle }) {
  const finalized = group.assignments.filter((item) => item.statut === "FINALISEE").length;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-5 py-4 flex items-center justify-between gap-4 hover:bg-slate-50 transition text-left"
      >
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-800">{group.session.nom}</h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
              {group.session.statut}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {formatDate(group.session.dateDebut)} - {formatDate(group.session.dateFin)}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-3 text-xs text-slate-500">
            <span>{group.assignments.length} affectation(s)</span>
            <span>{finalized} finalisee(s)</span>
          </div>
          {isOpen ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
        </div>
      </button>

      {isOpen && (
        <div className="border-t border-slate-100">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100">
                  <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-slate-400">Cours</th>
                  <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-slate-400">Professeur</th>
                  <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-slate-400">Programme</th>
                  <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-slate-400">Score</th>
                  <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-slate-400">Statut</th>
                  <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-slate-400">Maj</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {group.assignments.map((assignment) => (
                  <tr key={assignment.id} className="hover:bg-slate-50/70 transition">
                    <td className="px-5 py-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-slate-100 rounded-lg shrink-0">
                          <BookOpen className="w-4 h-4 text-slate-500" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-700">{assignment.course.nom}</p>
                          <p className="text-xs text-slate-400">{assignment.course.code} - Etape {assignment.course.etape}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-slate-100 rounded-lg shrink-0">
                          <User className="w-4 h-4 text-slate-500" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-700">
                            {assignment.professor.prenom} {assignment.professor.nom}
                          </p>
                          <p className="text-xs text-slate-400 inline-flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {assignment.professor.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-1">
                        {(assignment.course.programs ?? []).length > 0 ? (
                          assignment.course.programs.map((program) => (
                            <span key={program.id} className="text-[10px] font-bold px-2 py-1 rounded-lg bg-slate-100 text-slate-600">
                              {program.code}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-slate-300">-</span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm font-bold text-slate-700 tabular-nums">
                      {formatScore(assignment.score)}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex text-[10px] font-bold px-2.5 py-1 rounded-full border ${STATUT_STYLE[assignment.statut] ?? "bg-slate-50 text-slate-500 border-slate-200"}`}>
                        {assignment.statut}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-400 whitespace-nowrap">
                      {formatDate(assignment.updatedAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
