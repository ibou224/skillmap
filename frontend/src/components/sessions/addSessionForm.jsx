/**
 * @module components/sessions/addSessionForm
 * @description Fenêtre de formulaire pour créer ou modifier une session.
 */

"use client";

import React from "react";
import { Button } from "../ui/Button";
import { SAISONS } from "@/constants/constantes";
import { useState, useEffect, useMemo } from "react";
import {
  X,
  Save,
  PlusCircleIcon,
  CalendarDays,
  CalendarClock,
  Snowflake,
  Calendar,
} from "lucide-react";
import ErrorAlert from "../ui/ErrorAlert";

export default function AddSessionForm({
  open,
  onClose,
  onSubmit,
  formData,
  setFormData,
  isEditing = false,
  error,
  isLoading,
  onErrorClose = () => {},
}) {
  // Génère les années de maintenant à +5
  const ANNEES = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 6 }, (_, i) => currentYear + i);
  }, []);

  const [localError, setLocalError] = useState("");

  // --- STYLES RÉUTILISABLES ---
  const inputBaseClasses =
    "w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cite-green focus:border-transparent transition-all duration-200 bg-gray-50/50 focus:bg-white text-gray-800 placeholder-gray-400 disabled:bg-gray-100 disabled:text-gray-400";
  const labelClasses =
    "block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider";

  /**
   * Met à jour la saison ou l'année et recompose automatiquement le nom.
   */
  const formatSaisonName = (saison) => {
    const nom = saison && formData.annee ? `${saison} ${formData.annee}` : "";
    setFormData({ ...formData, saison, nom });
  };

  const handleAnneeChange = (annee) => {
    const nom = formData.saison && annee ? `${formData.saison} ${annee}` : "";
    setFormData({ ...formData, annee, nom });
  };

  const formatDureeSession = (dateDebut, dateFin) => {
    const start = new Date(dateDebut);
    const end = new Date(dateFin);
    const diff = end - start;
    if (diff < 0) return null;
    const weeks = Math.floor(diff / (1000 * 60 * 60 * 24 * 7));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    return `${weeks} semaines (${days} jours)`;
  };

  useEffect(() => {
    if (formData.dateDebut && formData.dateFin) {
      const end = new Date(formData.dateFin);
      const start = new Date(formData.dateDebut);
      const diff = end - start;
      if (diff < 0) {
        setLocalError("La date de fin doit être supérieure à la date de début");
      } else {
        setLocalError("");
      }
    }
  }, [formData.dateDebut, formData.dateFin]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-300">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* ── 1. EN-TÊTE ── */}
        <div className="px-6 py-5 flex items-center justify-between border-b border-gray-100 bg-gray-50/30">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2.5">
            {isEditing ? (
              <>
                <div className="p-2 bg-amber-50 rounded-lg border border-amber-100">
                  <Save className="w-5 h-5 text-amber-500" />
                </div>
                Modifier la session
              </>
            ) : (
              <>
                <div className="p-2 bg-cite-green/10 rounded-lg border border-cite-green/20">
                  <PlusCircleIcon className="w-5 h-5 text-cite-green" />
                </div>
                Ajouter une session
              </>
            )}
          </h2>
          <button
            onClick={onClose}
            type="button"
            className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            title="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

                  {/* Alerte d'erreur */}
          {(localError || error) && (
            <div className="absolute top-50 left-1/2 -translate-x-1/2 animate-in fade-in slide-in-from-top-2">
              <ErrorAlert
                message={localError || error}
                onClose={() => {
                  setLocalError("");
                  onErrorClose();
                }}
              />
            </div>
          )}

        {/* ── 2. CORPS DU FORMULAIRE ── */}
        <form
          onSubmit={onSubmit}
          className="p-6 space-y-6 overflow-y-auto flex-1"
        >
          {/* Nom composé : Saison + Année */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Saison */}
            <div>
              <label htmlFor="session-saison" className={labelClasses}>
                Saison <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Snowflake
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
                <select
                  id="session-saison"
                  value={formData.saison || ""}
                  onChange={(e) => formatSaisonName(e.target.value)}
                  className={`${inputBaseClasses} appearance-none cursor-pointer`}
                >
                  <option value="" disabled>
                    Sélectionnez
                  </option>
                  {SAISONS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Année */}
            <div>
              <label htmlFor="session-annee" className={labelClasses}>
                Année <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Calendar
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
                <select
                  id="session-annee"
                  value={formData.annee || ""}
                  onChange={(e) => handleAnneeChange(e.target.value)}
                  className={`${inputBaseClasses} appearance-none cursor-pointer`}
                >
                  <option value="" disabled>
                    Sélectionnez
                  </option>
                  {ANNEES.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Aperçu du nom généré */}
          {formData.nom && (
            <div className="bg-cite-green/5 border border-cite-green/15 rounded-xl px-4 py-2.5 text-sm">
              <span className="text-gray-500">Session : </span>
              <span className="font-bold text-gray-800">{formData.nom}</span>
            </div>
          )}

          <hr className="border-gray-100" />

          {/* Dates : début & fin */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Date de début */}
            <div>
              <label htmlFor="session-debut" className={labelClasses}>
                Date de début <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <CalendarDays
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
                <input
                  id="session-debut"
                  type="date"
                  value={formData.dateDebut || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, dateDebut: e.target.value })
                  }
                  className={`${inputBaseClasses} cursor-pointer`}
                />
              </div>
            </div>

            {/* Date de fin */}
            <div>
              <label htmlFor="session-fin" className={labelClasses}>
                Date de fin <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <CalendarClock
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
                <input
                  id="session-fin"
                  type="date"
                  value={formData.dateFin || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, dateFin: e.target.value })
                  }
                  min={formData.dateDebut || undefined}
                  className={`${inputBaseClasses} cursor-pointer`}
                />
              </div>
            </div>
          </div>

          {/* Indicateur visuel de la durée */}
          {formData.dateDebut &&
            formData.dateFin &&
            new Date(formData.dateFin) >= new Date(formData.dateDebut) && (
              <div className="bg-cite-green/5 border border-cite-green/15 rounded-xl px-4 py-3 flex items-center gap-3">
                <CalendarDays className="w-5 h-5 text-cite-green shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-cite-green">
                    Durée de la session :{" "}
                    <span className="text-sm font-normal text-gray-900">
                      {formatDureeSession(formData.dateDebut, formData.dateFin)}
                    </span>
                  </p>
                </div>
              </div>
            )}
          {/* ── 3. PIED DE PAGE (ACTIONS) ── */}
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/30 flex flex-col-reverse sm:flex-row justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              size="xl"
              onClick={onClose}
              className="w-full sm:w-auto text-gray-600 border-gray-200 hover:bg-gray-100"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              variant="citeGreen"
              size="xl"
              disabled={isLoading}
              className="w-full sm:w-auto shadow-sm"
            >
              <Save className="w-4 h-4 mr-2" />
              {isEditing
                ? isLoading
                  ? "Enregistrement..."
                  : "Enregistrer les modifications"
                : isLoading
                  ? "Ajout..."
                  : "Ajouter la session"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
