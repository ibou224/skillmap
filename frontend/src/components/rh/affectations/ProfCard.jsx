"use client";

import { ChevronDown, ChevronRight, User } from "lucide-react";
import { STATUT } from "@/constants/constantes";

function CourseRow({ aff }) {
  const s = STATUT[aff.statut] ?? STATUT.PROPOSEE;
  const score = Math.round((aff.score ?? 0) * 100);
  return (
    <div className="flex items-center justify-between px-6 py-3 hover:bg-slate-50/60 transition-colors">
      <div className="flex items-center gap-3 min-w-0">
        <span className="text-xs font-mono text-slate-400 shrink-0">{aff.cours.code}</span>
        <span className="text-sm font-medium text-slate-700 truncate">{aff.cours.nom}</span>
        {aff.cours.programmes?.[0] && (
          <span className="hidden sm:inline text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 shrink-0">
            {aff.cours.programmes[0].code}
          </span>
        )}
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <span className="text-sm font-black text-emerald-600">{score}%</span>
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border ${s.badge}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
          {s.label}
        </span>
      </div>
    </div>
  );
}

export function ProfCard({ professeur, affectations, isOpen, onToggle }) {
  const nbFinalise = affectations.filter((a) => a.statut === "FINALISEE").length;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-slate-50/60 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
            <User className="w-4 h-4 text-slate-500" />
          </div>
          <div className="text-left">
            <p className="text-sm font-bold text-gray-800">
              {professeur.prenom} {professeur.nom}
            </p>
            <p className="text-xs text-slate-400">{professeur.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500">
            {affectations.length} cours
            {nbFinalise > 0 && (
              <span className="ml-2 text-emerald-600 font-semibold">· {nbFinalise} finalisé{nbFinalise > 1 ? "s" : ""}</span>
            )}
          </span>
          {isOpen
            ? <ChevronDown className="w-4 h-4 text-slate-400" />
            : <ChevronRight className="w-4 h-4 text-slate-400" />}
        </div>
      </button>

      {isOpen && (
        <div className="border-t border-slate-100 divide-y divide-slate-50">
          {affectations.map((aff) => (
            <CourseRow key={aff.id} aff={aff} />
          ))}
        </div>
      )}
    </div>
  );
}
