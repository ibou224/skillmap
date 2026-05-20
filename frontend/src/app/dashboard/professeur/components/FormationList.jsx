import { GraduationCap } from "lucide-react";

export default function FormationList({ formations, emptyMessage = "Aucune formation renseignée." }) {
  if (!formations || formations.length === 0) {
    return <p className="text-xs text-slate-300">{emptyMessage}</p>;
  }

  return (
    <div>
      {formations.map((f, i) => (
        <div
          key={i}
          className="flex items-start gap-3.5 py-3.5 border-b border-slate-100 last:border-0 last:pb-0 first:pt-0"
        >
          <div className="w-9 h-9 rounded-[10px] bg-amber-50 flex items-center justify-center shrink-0 mt-0.5">
            <GraduationCap className="w-4 h-4 text-amber-600" />
          </div>
          <div>
            <p className="text-[13px] font-medium text-slate-800">{f.diplome}</p>
            <p className="text-[11.5px] text-slate-400 mt-0.5 font-light">{f.etablissement}</p>
            <p className="text-[11px] text-emerald-600 font-medium mt-1">{f.anneeObtention}</p>
          </div>
        </div>
      ))}
    </div>
  );
}