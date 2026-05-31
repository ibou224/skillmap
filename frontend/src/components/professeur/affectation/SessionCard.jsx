"use client";

/**
 * @module components/professeur/affectation/SessionCard
 * @description Carte dépliable d'une session listant les cours affectés (professeur).
 */

import { ChevronDown, ChevronRight, BookOpen } from "lucide-react";
import { PERIODE } from "@/constants/constantes";
import { SessionList } from "./SessionList";

/**
 * Carte d'une session avec liste de cours dépliable.
 * @param {Object} props
 * @param {Object} props.session - Session (nom, période, cours...).
 * @param {boolean} props.isOpen - Carte dépliée si vrai.
 * @param {Function} props.onToggle - Ouvre/ferme la carte.
 * @returns {JSX.Element} La carte de session.
 */
export function SessionCard({ session, isOpen, onToggle }) {
  const periode = PERIODE[session.periode] ?? null;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-slate-50/60 transition-colors"
      >
        <div className="flex items-center gap-3">
          {periode && (
            <div className={`w-8 h-8 rounded-xl bg-linear-to-br ${periode.gradient} flex items-center justify-center shrink-0`}>
              <periode.Icon className="w-4 h-4 text-white" />
            </div>
          )}
          <div className="text-left">
            <p className="text-sm font-bold text-gray-800">{session.nom}</p>
            <p className="text-xs text-slate-400">
              {session.cours.length} cours affecté{session.cours.length > 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {session.statut === "ACTIVE" && (
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">
              Active
            </span>
          )}
          <BookOpen className="w-4 h-4 text-slate-300" />
          {isOpen
            ? <ChevronDown className="w-4 h-4 text-slate-400" />
            : <ChevronRight className="w-4 h-4 text-slate-400" />}
        </div>
      </button>

      {isOpen && (
        <div className="border-t border-slate-100">
          <SessionList cours={session.cours} />
        </div>
      )}
    </div>
  );
}
