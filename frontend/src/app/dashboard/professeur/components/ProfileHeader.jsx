// components/ProfileHeader.jsx
import { RefreshCw, Edit3 } from "lucide-react";
import Link from "next/link";

export default function ProfileHeader({
  prenom,
  nom,
  titre = "Professeure en informatique",
  totalExp,
  competencesCount,
  formationsCount,
  languesCount,
  onRefresh,
  editLink = "/dashboard/professeur/cv",
}) {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-[hsl(134,35%,45%)] to-[#135d55] p-8 md:p-10 shadow-lg">
      {/* Cercles décoratifs */}
      <div className="pointer-events-none absolute -top-24 -right-24 w-80 h-80 rounded-full border border-white/5" />
      <div className="pointer-events-none absolute -bottom-32 -left-16 w-64 h-64 rounded-full border border-white/5" />

      <div className="relative flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-white/50 mb-3">
            Mon profil
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
            {prenom} {nom}
          </h1>
          <p className="text-sm text-white/50 mt-2 font-light">{titre}</p>
        </div>

        <div className="flex items-center gap-3 self-start lg:self-end">
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
      <div className="relative mt-10 pt-6 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { value: `${totalExp * 4} ans`, label: "Expérience" },
          { value: competencesCount, label: "Compétences" },
          { value: formationsCount, label: "Formations" },
          { value: languesCount, label: "Langues" },
        ].map(({ value, label }) => (
          <div key={label} className="text-center sm:text-left">
            <p className="text-xl font-bold text-white">{value}</p>
            <p className="text-xs text-white/50 mt-1">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}