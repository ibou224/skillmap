"use client";

/**
 * @module components/ui/ConfirmModal
 * @description Fenêtre modale de confirmation d'action destructrice (avec état de chargement).
 */

import { AlertTriangle, Loader2 } from "lucide-react";

/**
 * Modale de confirmation (ex. suppression).
 * @param {Object} props
 * @param {boolean} props.isOpen - Affiche la modale si vrai.
 * @param {string} props.title - Titre de la modale.
 * @param {string} props.message - Message de confirmation.
 * @param {Function} props.onConfirm - Callback de confirmation.
 * @param {Function} props.onCancel - Callback d'annulation/fermeture.
 * @param {boolean} [props.isLoading=false] - Affiche l'état de chargement et désactive les boutons.
 * @returns {JSX.Element|null} La modale, ou null si fermée.
 */
export default function ConfirmModal({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  isLoading = false,
}) {
  if (!isOpen) return null;
  

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm transition-opacity"
      onClick={(e) => { if (e.target === e.currentTarget && !isLoading) onCancel(); }}
    >
      <div className="bg-white flex flex-col w-full max-w-md rounded-2xl border border-slate-100 shadow-2xl overflow-hidden transform transition-all scale-100 p-6 space-y-6">
        
        <div className="flex gap-4 items-center">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-red-50 text-red-600 shrink-0">
            <AlertTriangle size={24} />
          </div>
             <h2 className="text-base font-semibold text-slate-900">
              {title}
            </h2>
        </div>
         <div className="space-y-1">
            <p className="text-[15px] text-slate-600 leading-relaxed text-center">
              {message}
            </p>
          </div>

        <div className="flex flex-col-reverse sm:flex-row justify-end gap-2.5 pt-2">
          <button
            type="button"
            disabled={isLoading}
            onClick={onCancel}
            className="w-full sm:w-auto px-4 py-2.5 text-sm cursor-pointer font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 active:bg-slate-100 disabled:opacity-50 transition-colors"
          >
            Annuler
          </button>

          <button
            type="button"
            disabled={isLoading}
            onClick={onConfirm}
            className="w-full sm:w-auto inline-flex items-center cursor-pointer justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-red-600 rounded-xl hover:bg-red-700 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none shadow-sm shadow-red-600/10 transition-all"
          >
            {isLoading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Suppression…
              </>
            ) : (
              "Confirmer"
            )}
          </button>
        </div>

      </div>
    </div>
  );
}