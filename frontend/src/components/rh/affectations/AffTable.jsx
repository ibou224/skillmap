import { FileText } from "lucide-react";
import { STATUT } from "@/constants/constantes";

export default function AffTable({ proposals }) {
  if (proposals.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm text-center py-16">
        <FileText className="w-10 h-10 text-slate-200 mx-auto mb-3" />
        <p className="text-sm text-slate-400">Aucune affectation pour cette sélection</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <table className="w-full text-sm">
        <thead className="border-b border-slate-100 bg-slate-50/60">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Professeur</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">Cours</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide hidden lg:table-cell">Programme</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Score</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Statut</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {proposals.map((p) => {
            const s = STATUT[p.statut] ?? STATUT.PROPOSEE;
            const score = Math.round((p.score ?? 0) * 100);
            return (
              <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                <td className="px-6 py-4">
                  <p className="font-semibold text-gray-800">{p.professeur.prenom} {p.professeur.nom}</p>
                  <p className="text-xs text-slate-400">{p.professeur.email}</p>
                </td>
                <td className="px-6 py-4 hidden md:table-cell">
                  <p className="text-slate-700 font-medium">{p.cours.nom}</p>
                  <p className="text-xs text-slate-400">{p.cours.code}</p>
                </td>
                <td className="px-6 py-4 hidden lg:table-cell">
                  <span className="text-xs font-medium text-slate-500">
                    {p.cours.programmes?.[0]?.code ?? "—"}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm font-black text-emerald-600">{score}%</span>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border ${s.badge}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                    {s.label}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
