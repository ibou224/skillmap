// components/ExperienceTimeline.jsx
import { Briefcase } from "lucide-react";

// ─── Élément individuel de la timeline ───────────────────────────────────────
function TimelineItem({ exp, isActive }) {
  const formatDate = (str) => {
    if (!str) return "Aujourd'hui";
    const [y, m] = str.split("-");
    const months = [
      "Jan", "Fév", "Mar", "Avr", "Mai", "Juin",
      "Juil", "Août", "Sep", "Oct", "Nov", "Déc"
    ];
    return `${months[parseInt(m) - 1]}. ${y}`;
  };

  return (
    <div className="relative pl-8 pb-6 last:pb-0">
      {/* Ligne verticale */}
      <div className="absolute left-[10px] top-[18px] bottom-0 w-px bg-slate-100 last:hidden" />
      {/* Point */}
      <div
        className={`absolute left-[5px] top-1.5 w-[11px] h-[11px] rounded-full border-2 border-emerald-500 ${
          isActive ? "bg-emerald-500" : "bg-white"
        }`}
      />

      <p className="text-[13.5px] font-medium text-slate-800">{exp.poste}</p>
      <p className="text-[12px] text-slate-400 mt-0.5">{exp.entreprise}</p>
      <span className="inline-block text-[10.5px] text-slate-400 bg-slate-50 border border-slate-100 rounded-full px-2.5 py-0.5 mt-2 mb-2">
        {formatDate(exp.debut)} — {formatDate(exp.fin)}
      </span>
      {exp.description && (
        <p className="text-[12px] text-slate-500 leading-relaxed font-light">
          {exp.description}
        </p>
      )}
    </div>
  );
}

// ─── Liste de la timeline ────────────────────────────────────────────────────
export default function ExperienceTimeline({
  experiences,
  emptyMessage = "Aucune expérience renseignée.",
  isActiveFn = (index) => index === 0,
}) {
  if (!experiences || experiences.length === 0) {
    return <p className="text-xs text-slate-300">{emptyMessage}</p>;
  }

  return (
    <div>
      {experiences.map((exp, i) => (
        <TimelineItem key={i} exp={exp} isActive={isActiveFn(i)} />
      ))}
    </div>
  );
}