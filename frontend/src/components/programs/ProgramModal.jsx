"use client";

import { useState } from "react";
import { X, Loader2 } from "lucide-react";

const inputCls =
  "w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition bg-white";
const inputErrCls =
  "w-full px-3 py-2.5 text-sm border border-red-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-400/30 focus:border-red-400 transition bg-white";

const DEFAULT_FORM = { code: "", nom: "", nbEtapes: "1", departementId: "" };

/**
 * fieldErrors  — erreurs par champ renvoyées par le hook (validation centralisée)
 * serverError  — message d'erreur global renvoyé par l'API (ex: code déjà utilisé)
 */
export default function ProgramModal({
  isOpen,
  onClose,
  programToEdit,
  departements = [],
  onSubmit,
  isLoading,
  fieldErrors = {},
  serverError,
}) {
  const isEditing = !!programToEdit;

  /* État initialisé une seule fois au montage.
     Le parent change la `key` pour forcer un remontage avec de nouvelles valeurs. */
  const [form, setForm] = useState(() =>
    programToEdit
      ? {
          code:          programToEdit.code          ?? "",
          nom:           programToEdit.nom            ?? "",
          nbEtapes:      String(programToEdit.nbEtapes ?? 1),
          departementId: programToEdit.departementId  ?? "",
        }
      : DEFAULT_FORM
  );

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  /* Pas de validation locale — le hook valide et renvoie fieldErrors */
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      code:          form.code.trim().toUpperCase(),
      nom:           form.nom.trim(),
      nbEtapes:      Number(form.nbEtapes),
      departementId: form.departementId || null,
    });
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget && !isLoading) onClose(); }}
    >
      <div className="bg-white w-full max-w-md rounded-2xl border border-slate-100 shadow-2xl overflow-hidden">

        {/* En-tête */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-800">
            {isEditing ? "Modifier le programme" : "Créer un programme"}
          </h2>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition disabled:opacity-40"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">

          {/* Code */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Code <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="ex: INF"
              maxLength={20}
              value={form.code}
              onChange={set("code")}
              disabled={isLoading}
              className={fieldErrors.code ? inputErrCls : inputCls}
            />
            {fieldErrors.code && (
              <p className="text-xs text-red-500 mt-1">{fieldErrors.code}</p>
            )}
          </div>

          {/* Nom */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Nom <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="ex: Informatique de gestion"
              value={form.nom}
              onChange={set("nom")}
              disabled={isLoading}
              className={fieldErrors.nom ? inputErrCls : inputCls}
            />
            {fieldErrors.nom && (
              <p className="text-xs text-red-500 mt-1">{fieldErrors.nom}</p>
            )}
          </div>

          {/* Nombre d'étapes */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Nombre d'étapes <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min={1}
              max={10}
              value={form.nbEtapes}
              onChange={set("nbEtapes")}
              disabled={isLoading}
              className={fieldErrors.nbEtapes ? inputErrCls : inputCls}
            />
            {fieldErrors.nbEtapes && (
              <p className="text-xs text-red-500 mt-1">{fieldErrors.nbEtapes}</p>
            )}
          </div>

          {/* Département (optionnel) */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Département <span className="text-slate-400 font-normal">(optionnel)</span>
            </label>
            <select
              value={form.departementId}
              onChange={set("departementId")}
              disabled={isLoading}
              className={inputCls}
            >
              <option value="">— Aucun département —</option>
              {departements.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.nom}
                </option>
              ))}
            </select>
          </div>

          {/* Erreur serveur globale (ex: code déjà utilisé) */}
          {serverError && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {serverError}
            </p>
          )}

          {/* Actions */}
          <div className="flex gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-50 transition"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 disabled:opacity-50 disabled:pointer-events-none transition shadow-sm"
            >
              {isLoading ? (
                <><Loader2 className="w-4 h-4 animate-spin" />{isEditing ? "Modification…" : "Création…"}</>
              ) : (
                isEditing ? "Enregistrer" : "Créer"
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
