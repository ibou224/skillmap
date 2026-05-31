/**
 * @module components/ui/Feedback
 * @description Message de retour inline (succès ou erreur) avec icône.
 */

import { AlertCircle, CheckCircle2 } from "lucide-react";

/**
 * Affiche un message de feedback coloré selon son type.
 * @param {Object} props
 * @param {"error"|"success"} props.type - Type de message.
 * @param {string} props.message - Texte à afficher (rien n'est rendu si vide).
 * @returns {JSX.Element|null} Le message, ou null si aucun message.
 */
export default function Feedback({ type, message }) {
    if (!message) return null;
    const isError = type === "error";
    return (
      <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium
        ${isError ? "bg-red-50 text-red-700 border border-red-200" : "bg-emerald-50 text-emerald-700 border border-emerald-200"}`}>
        {isError
          ? <AlertCircle className="w-4 h-4 shrink-0" />
          : <CheckCircle2 className="w-4 h-4 shrink-0" />}
        {message}
      </div>
    );
  }