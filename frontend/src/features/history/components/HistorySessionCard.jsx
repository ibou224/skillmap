"use client";

/**
 * @module features/history/components/HistorySessionCard
 * @description Carte dépliable d'une session listant ses affectations historisées (paginées).
 */

import { useState } from "react";
import { BookOpen, ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Mail, User } from "lucide-react";

/** Nombre d'affectations affichées par page dans la carte. */
const ASSIGNMENTS_PER_PAGE = 50;

/** Styles de badge par statut d'affectation. */
const STATUT_STYLE = {
  PROPOSEE:  "bg-blue-50 text-blue-700 border-blue-200",
  AJUSTEE:   "bg-amber-50 text-amber-700 border-amber-200",
  FINALISEE: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

function formatDate(value) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("fr-CA", {
    year: "numeric", month: "short", day: "numeric",
  });
}

function formatScore(score) {
  if (typeof score !== "number") return "-";
  return `${score.toFixed(1)}%`;
}

export default function HistorySessionCard({ group, isOpen, onToggle }) {
  const [page, setPage] = useState(1);

  const finalized    = group.assignments.filter((a) => a.statut === "FINALISEE").length;
  const total        = group.assignments.length;
  const totalPages   = Math.max(1, Math.ceil(total / ASSIGNMENTS_PER_PAGE));
  const currentPage  = Math.min(page, totalPages);
  const paginated    = group.assignments.slice(
    (currentPage - 1) * ASSIGNMENTS_PER_PAGE,
    currentPage * ASSIGNMENTS_PER_PAGE,
  );

  const handleToggle = () => {
    // Revenir à la page 1 à chaque réouverture
    if (!isOpen) setPage(1);
    onToggle();
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* En-tête accordion */}
      <button
        onClick={handleToggle}
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
            <span>{total} affectation{total > 1 ? "s" : ""}</span>
            <span>{finalized} finalisée{finalized > 1 ? "s" : ""}</span>
          </div>
          {isOpen ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
        </div>
      </button>

      {/* Corps — tableau paginé */}
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
                {paginated.map((assignment) => (
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

          {/* Pied de tableau — pagination */}
          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 bg-slate-50/50">
            <p className="text-xs text-slate-400">
              {total} affectation{total > 1 ? "s" : ""} — page {currentPage} / {totalPages}
            </p>
            {totalPages > 1 && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage <= 1}
                  className="p-1.5 rounded-lg hover:bg-slate-200 disabled:opacity-40 transition"
                >
                  <ChevronLeft className="w-4 h-4 text-slate-500" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                  .reduce((acc, p, i, arr) => {
                    if (i > 0 && p - arr[i - 1] > 1) acc.push("…");
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((p, i) =>
                    p === "…" ? (
                      <span key={`e-${i}`} className="px-1 text-slate-400 text-xs">…</span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`w-7 h-7 rounded-lg text-xs font-semibold transition ${
                          p === currentPage
                            ? "bg-[hsl(134,35%,45%)] text-white"
                            : "hover:bg-slate-200 text-slate-500"
                        }`}
                      >
                        {p}
                      </button>
                    )
                  )}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage >= totalPages}
                  className="p-1.5 rounded-lg hover:bg-slate-200 disabled:opacity-40 transition"
                >
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
