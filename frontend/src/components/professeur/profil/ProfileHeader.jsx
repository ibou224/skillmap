/**
 * @module components/professeur/profil/ProfileHeader
 * @description En-tête du profil professeur (avatar, identité, compteurs et lien d'édition).
 */

import { RefreshCw, Edit3, Briefcase, Lightbulb, GraduationCap, Languages } from "lucide-react";
import Link from "next/link";

/** Définition des compteurs affichés dans l'en-tête. */
const STATS = [
  { icon: Briefcase,     key: "experiences",  label: "Expériences" },
  { icon: Lightbulb,     key: "competences",  label: "Compétences" },
  { icon: GraduationCap, key: "formations",   label: "Formations"  },
  { icon: Languages,     key: "langues",      label: "Langues"     },
];

/**
 * En-tête de profil du professeur.
 * @param {Object} props
 * @param {Object} props.professeur - Données du professeur (et compteurs).
 * @param {Function} props.onRefresh - Recharge les données du profil.
 * @param {string} [props.editLink] - Lien vers l'édition du CV.
 * @returns {JSX.Element} L'en-tête de profil.
 */
export default function ProfileHeader({ professeur, onRefresh, editLink = "/dashboard/professeur/cv?tab=manual" }) {
  const initials = `${professeur.prenom?.[0] ?? ""}${professeur.nom?.[0] ?? ""}`.toUpperCase();

  return (
    <div className="relative overflow-hidden rounded-3xl p-8 md:p-10 shadow-lg bg-linear-to-br from-[hsl(134,35%,45%)] to-[#135d55]">
      <div className="pointer-events-none absolute -top-24 -right-24 w-80 h-80 rounded-full border border-white/5" />
      <div className="pointer-events-none absolute -bottom-32 -left-16 w-64 h-64 rounded-full border border-white/5" />

      <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        {/* Avatar + identité */}
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-2xl bg-white/15 border border-white/20 text-white text-3xl font-black flex items-center justify-center select-none shrink-0">
            {initials}
          </div>
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/50 mb-1.5">Mon profil</p>
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight leading-none">
              {professeur.prenom} {professeur.nom}
            </h1>
            <p className="text-sm text-white/50 mt-1.5 font-light">{professeur.titre}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 sm:self-start">
          {onRefresh && (
            <button
              onClick={onRefresh}
              title="Actualiser"
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white flex items-center justify-center transition"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
          <Link
            href={editLink}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-emerald-800 text-sm font-semibold rounded-full hover:bg-white/90 transition shadow-sm"
          >
            <Edit3 className="w-4 h-4" />
            Modifier le CV
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="relative mt-8 pt-6 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4">
        {STATS.map(({ icon: Icon, key, label }) => (
          <div key={key} className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
              <Icon className="w-4 h-4 text-white/70" />
            </div>
            <div>
              <p className="text-2xl font-black text-white leading-none">
                {professeur[key]?.length ?? 0}
              </p>
              <p className="text-[11px] text-white/50 mt-0.5">{label}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
