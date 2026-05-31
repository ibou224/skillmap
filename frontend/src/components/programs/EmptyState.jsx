/**
 * @module components/programs/EmptyState
 * @description État vide de la liste des programmes (avec ou sans recherche active).
 */

import { Search, BookOpen, PlusCircle} from "lucide-react";

/**
 * État vide de la liste de programmes.
 * @param {Object} props
 * @param {string} props.search - Recherche courante (adapte le message).
 * @param {Function} props.onAdd - Ouvre le formulaire d'ajout d'un programme.
 * @returns {JSX.Element} L'état vide.
 */
export default function EmptyState({ search, onAdd }) {
  if (search) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center">
          <Search className="w-7 h-7 text-slate-400" />
        </div>
        <div>
          <p className="text-base font-semibold text-slate-700">Aucun résultat</p>
          <p className="text-sm text-slate-400 mt-1">
            Aucun programme ne correspond à «&nbsp;<span className="font-medium">{search}</span>&nbsp;».
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-24 gap-5 text-center">
      <div className="relative">
        <div className="w-20 h-20 rounded-3xl bg-linear-to-br from-emerald-100 to-teal-50 border border-emerald-100 flex items-center justify-center shadow-sm">
          <BookOpen className="w-9 h-9 text-emerald-600" />
        </div>
        <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-amber-400 flex items-center justify-center shadow-sm">
          <PlusCircle className="w-3.5 h-3.5 text-white" />
        </span>
      </div>
      <div className="max-w-xs">
        <p className="text-lg font-bold text-slate-800">Aucun programme enregistré</p>
        <p className="text-sm text-slate-400 mt-1 leading-relaxed">
          Commencez par créer votre premier programme d'études.
        </p>
      </div>
      <button
        onClick={onAdd}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition shadow-sm"
      >
        <PlusCircle className="w-4 h-4" />
        Créer un programme
      </button>
    </div>
  );
}