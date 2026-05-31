/**
 * @module components/programs/ProgramRow
 * @description Ligne de tableau d'un programme avec actions d'édition/suppression.
 */

import { Building2, Layers, Pencil, Trash2 } from "lucide-react";

/**
 * Ligne de tableau d'un programme.
 * @param {Object} props
 * @param {Object} props.program - Programme (code, nom, nbEtapes, département...).
 * @param {Function} props.onEdit - Callback d'édition.
 * @param {Function} props.onDelete - Callback de suppression.
 * @returns {JSX.Element} La ligne du programme.
 */
export default function ProgramRow({ program, onEdit, onDelete }) {
  return (
    <tr className="hover:bg-slate-50 transition-colors group">
      <td className="px-5 py-3.5">
        <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-100">
          {program.code}
        </span>
      </td>
      <td className="px-5 py-3.5">
        <p className="text-sm font-semibold text-slate-800">{program.nom}</p>
      </td>
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-1.5 text-sm text-slate-500">
          <Building2 className="w-3.5 h-3.5 shrink-0 text-slate-400" />
          <span>{program.departement?.nom ?? "—"}</span>
        </div>
      </td>
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-1.5 text-sm text-slate-500">
          <Layers className="w-3.5 h-3.5 shrink-0 text-slate-400" />
          <span>{program.nbEtapes} étape{program.nbEtapes > 1 ? "s" : ""}</span>
        </div>
      </td>
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(program)}
            title="Modifier"
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(program)}
            title="Supprimer"
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </td>
    </tr>
  );
}