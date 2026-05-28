import { NIVEAU_BARS, NIVEAU_LABEL } from "../../constants/cvConstantes";


export function fmtPeriod(debut, fin) {
  if (!debut) return "";
  const d = debut.slice(0, 7).replace("-", "/");
  const f = fin ? fin.slice(0, 7).replace("-", "/") : "Présent";
  return `${d} — ${f}`;
}


export function SectionTitle({ icon: Icon, children, color = "text-[hsl(134,35%,45%)]" }) {
  return (
    <div className={`flex items-center gap-2 mb-3 pb-2 border-b border-slate-100 ${color}`}>
      <Icon className="w-4 h-4 shrink-0" />
      <h3 className="text-xs font-black uppercase tracking-widest">{children}</h3>
    </div>
  );
}

export function NiveauBar({ niveau }) {
  const filled = NIVEAU_BARS[niveau] ?? 2;
  return (
    <div className="flex gap-0.5" title={NIVEAU_LABEL[niveau] ?? niveau}>
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className={`h-1.5 w-4 rounded-full transition-all ${
            i < filled ? "bg-[hsl(134,35%,45%)]" : "bg-slate-200"
          }`}
        />
      ))}
    </div>
  );
}

export function TimelineDot() {
  return (
    <div className="relative flex flex-col items-center">
      <div className="w-3 h-3 rounded-full bg-[hsl(134,35%,45%)] border-2 border-white shadow-sm shrink-0 mt-0.5" />
      <div className="w-px flex-1 bg-slate-200 mt-1" />
    </div>
  );
}