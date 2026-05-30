import { GraduationCap, Trash2 } from "lucide-react";

const inputCls = "w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[hsl(134,35%,45%)] transition bg-white";

const NIVEAU_OPTIONS = [
  { value: "DOCTORATE",  label: "Doctorat (Ph.D.) — 100%" },
  { value: "MASTERS",    label: "Maîtrise (M.Sc. / M.A. / M.Eng.) — 100%" },
  { value: "BACHELORS",  label: "Baccalauréat (B.Sc. / B.A.) — 60%" },
  { value: "DEC",        label: "DEC / Diplôme technique — 30%" },
  { value: "OTHER",      label: "Autre — 10%" },
];

export default function FormationForm({ formation, index, onUpdate, onRemove, canDelete }) {
  return (
    <div className="relative border border-slate-100 rounded-2xl p-4 bg-slate-50/40 space-y-3">
      {canDelete && (
        <button onClick={onRemove} className="absolute top-3 right-3 text-slate-300 hover:text-red-400 transition">
          <Trash2 className="w-4 h-4" />
        </button>
      )}
      <p className="text-xs font-bold text-[hsl(134,35%,45%)] uppercase tracking-widest">Formation {index + 1}</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="space-y-1 sm:col-span-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1">
            <GraduationCap className="w-3 h-3" /> Diplôme / Titre
          </label>
          <input
            placeholder="Maîtrise en informatique"
            value={formation.diplome ?? ""}
            onChange={(e) => onUpdate("diplome", e.target.value)}
            className={inputCls}
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Année d&apos;obtention</label>
          <input
            type="number" placeholder="2020" min={1950} max={2099}
            value={formation.anneeObtention ?? ""}
            onChange={(e) => onUpdate("anneeObtention", e.target.value)}
            className={inputCls}
          />
        </div>
        <div className="space-y-1 sm:col-span-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Niveau du diplôme</label>
          <select
            value={formation.niveauDiplome ?? "OTHER"}
            onChange={(e) => onUpdate("niveauDiplome", e.target.value)}
            className={inputCls}
          >
            {NIVEAU_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Établissement</label>
          <input
            placeholder="Université de Montréal"
            value={formation.etablissement ?? ""}
            onChange={(e) => onUpdate("etablissement", e.target.value)}
            className={inputCls}
          />
        </div>
      </div>
    </div>
  );
}