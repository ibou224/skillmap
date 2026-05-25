/**
 * @module components/sessions/SessionTable
 * @description Tableau d'affichage des sessions académiques.
 */

"use client";

import React from "react";
import { Pencil, Trash2, CalendarX, Zap } from "lucide-react";
import { useCallback } from "react";
import { Button } from "../ui/Button";

const STATUT_STYLE = {
  ACTIVE:    { bg: "bg-emerald-50", text: "text-emerald-700", label: "Active" },
  PLANIFIEE: { bg: "bg-amber-50",   text: "text-amber-700",   label: "Planifiée" },
  ARCHIVEE:  { bg: "bg-slate-100",  text: "text-slate-500",   label: "Archivée" },
};

/**
 * Affiche les sessions dans un tableau avec leurs compteurs.
 *
 * @param {Object} props - Propriétés du composant.
 * @param {Array<Object>} [props.sessions=[]] - Liste des sessions.
 * @param {Function} props.onEdit - Ouvre l'édition d'une session.
 * @param {Function} props.onDelete - Supprime une session.
 * @returns {JSX.Element} Tableau des sessions.
 */
export default function SessionTable({ sessions = [], onEdit, onDelete, onActivate }) {
  const formatDate = useCallback((dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("fr-CA", {
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    });
  }, []);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="text-left px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
                Nom
              </th>
              <th className="text-left px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
                Date début
              </th>
              <th className="text-left px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
                Date fin
              </th>
              <th className="text-center px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
                Groupes
              </th>
              <th className="text-center px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
                Affectations
              </th>
              <th className="text-right px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {sessions.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-10 text-center text-slate-400">
                  <div className="flex flex-col items-center gap-3 text-slate-400">
                    <CalendarX className="mx-auto mb-2 w-8 h-8" />
                    <p className="text-sm">Aucune session disponible</p>
                  </div>
                </td>
              </tr>
            )}
            {sessions.map((session) => {
              const groupeCount =
                session._count?.groupes ?? session.groupes?.length ?? 0;
              const affectationCount =
                session._count?.affectations ??
                session.affectations?.length ??
                0;

              return (
                <tr
                  key={session.id}
                  className="hover:bg-slate-50/50 transition-colors"
                >
                  <td className="px-5 py-3.5">
                    <span className="font-semibold text-slate-800">
                      {session.nom}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-slate-600">
                    {formatDate(session.dateDebut)}
                  </td>
                  <td className="px-5 py-3.5 text-slate-600">
                    {formatDate(session.dateFin)}
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                      {groupeCount}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                      {affectationCount}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="inline-flex gap-1.5 justify-end">
                      <Button
                        onClick={() => onEdit(session)}
                        variant="citeGreenLight"
                        size="iconSm"
                        title="Modifier"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        onClick={() => onDelete(session)}
                        variant="dangerFill"
                        size="iconSm"
                        title="Supprimer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
