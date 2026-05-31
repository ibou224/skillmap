"use client";

/**
 * @module components/affectations/Toast
 * @description Notification toast légère et auto-disparaissante.
 */

import { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

/** Styles de couleur par type de toast. */
const STYLES = {
  success: "bg-emerald-50 border-emerald-200 text-emerald-800",
  error:   "bg-red-50   border-red-200   text-red-800",
  info:    "bg-blue-50  border-blue-200  text-blue-800",
};

/**
 * Notification légère auto-disparaissante (4s).
 * @param {Object} props
 * @param {string} props.message - Message à afficher.
 * @param {"success"|"error"|"info"} props.type - Type de notification.
 * @param {Function} props.onClose - Callback de fermeture (auto après 4s ou clic).
 * @returns {JSX.Element} Le toast.
 */
export default function Toast({ message, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <>
      <div
        className={cn(
          "fixed bottom-4 right-4 z-50 flex items-center gap-3",
          "px-4 py-3 rounded-xl border shadow-lg",
          "animate-[slideUp_0.3s_ease-out]",
          STYLES[type]
        )}
        role="alert"
      >
        <span className="text-sm font-medium">{message}</span>
        <button
          onClick={onClose}
          className="p-1 hover:bg-black/5 rounded"
          aria-label="Fermer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Keyframe déclaré ici pour ne pas polluer le layout global */}
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}
