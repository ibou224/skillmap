import { Layers, AlertCircle, Edit3, Check, Award } from "lucide-react";
import { cn } from "@/lib/utils";
import { STATUT } from "@/constants/constantes";

/**
 * Bande de 5 cartes : Total, Proposées, Ajustées, Finalisées, Score moyen.
 * @param {{ proposals: Array }} props
 */
export default function AffectationStats({ proposals }) {
  const total      = proposals.length;
  const proposees  = proposals.filter((p) => p.statut === "PROPOSEE").length;
  const ajustees   = proposals.filter((p) => p.statut === "AJUSTEE").length;
  const finalisees = proposals.filter((p) => p.statut === "FINALISEE").length;
  const scoreMoyen = total > 0
    ? (proposals.reduce((s, p) => s + p.score, 0) / total).toFixed(1)
    : "—";

  const cards = [
    { label: "Total",       value: total,           color: "text-slate-700 dark:text-slate-200", icon: Layers      },
    { label: "Proposées",   value: proposees,        color: STATUT.PROPOSEE.color,                icon: AlertCircle },
    { label: "Ajustées",    value: ajustees,         color: STATUT.AJUSTEE.color,                 icon: Edit3       },
    { label: "Finalisées",  value: finalisees,       color: STATUT.FINALISEE.color,               icon: Check       },
    { label: "Score moyen", value: `${scoreMoyen}%`, color: "text-emerald-600",                   icon: Award       },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {cards.map(({ label, value, color, icon: Icon }) => (
        <div
          key={label}
          className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm hover:shadow-md transition"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className={cn("text-2xl font-bold tabular-nums", color)}>{value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{label}</p>
            </div>
            <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
              <Icon className="w-4 h-4 text-slate-400" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
