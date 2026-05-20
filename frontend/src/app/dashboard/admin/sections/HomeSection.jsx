import {
  Users, BookOpen, FileText,
  TrendingUp, Clock, Layers, Settings2,
} from "lucide-react";
import Link from "next/link";
import {
  STATS,
  AFFECTATIONS_CHART,
  CVS_CHART,
  RECENT_ACTIVITY,
  TYPE_COLOR,
  TYPE_LABEL,
} from "./homeDashboardData";

const SHORTCUT_ICONS = { Users, BookOpen, Layers, Settings2 };

const SHORTCUTS = [
  { label: "Utilisateurs", href: "/dashboard/admin/users", icon: "Users", color: "text-blue-500", bg: "bg-blue-50" },
  { label: "Cours", href: "/dashboard/admin/courses", icon: "BookOpen", color: "text-emerald-600", bg: "bg-emerald-50" },
  { label: "Programmes", href: "/dashboard/admin/programs", icon: "Layers", color: "text-violet-500", bg: "bg-violet-50" },
  { label: "Paramètres", href: "/dashboard/admin/settings", icon: "Settings2", color: "text-slate-500", bg: "bg-slate-100" },
];

function BarChart({ data, color, ariaLabel }) {
  return (
    <div role="img" aria-label={ariaLabel} className="flex items-end gap-2 h-28 mt-4">
      {data.map((d) => {
        const pct = Math.round((d.value / d.max) * 100);
        return (
          <div key={d.label} className="flex flex-col items-center gap-1 flex-1">
            <span className="text-[10px] font-bold text-slate-400">{d.value}</span>
            <div className="w-full bg-slate-100 rounded-lg overflow-hidden flex-1 flex items-end" style={{ minHeight: 60 }}>
              <div className={`w-full rounded-lg transition-all duration-300 ${color}`} style={{ height: `${pct}%` }} />
            </div>
            <span className="text-[9px] text-slate-400 text-center leading-tight">{d.label}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function HomeSection() {
  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-3xl p-8 shadow-lg bg-linear-to-br from-[hsl(134,35%,45%)] to-[#135d55]">
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/10 pointer-events-none" />
        <div className="absolute -bottom-6 -left-6 w-28 h-28 rounded-full bg-white/5 pointer-events-none" />
        <h1 className="relative text-2xl sm:text-3xl font-black text-white">Vue d&apos;ensemble</h1>
        <p className="relative text-white/70 text-sm mt-1">Tableau de bord administrateur — SkillMap</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {STATS.map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-3">
            <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center ${s.color}`}>
              {s.icon}
            </div>
            <div>
              <p className="text-2xl font-black text-gray-800">{s.value}</p>
              <p className="text-xs font-semibold text-slate-500">{s.label}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">{s.sub}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <h2 className="text-sm font-bold text-gray-700">{AFFECTATIONS_CHART.title}</h2>
          </div>
          <p className="text-xs text-slate-400">{AFFECTATIONS_CHART.subtitle}</p>
          <BarChart
            data={AFFECTATIONS_CHART.data}
            color={AFFECTATIONS_CHART.color}
            ariaLabel={AFFECTATIONS_CHART.title}
          />
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-1">
            <FileText className="w-4 h-4 text-amber-500" />
            <h2 className="text-sm font-bold text-gray-700">{CVS_CHART.title}</h2>
          </div>
          <p className="text-xs text-slate-400">{CVS_CHART.subtitle}</p>
          <BarChart
            data={CVS_CHART.data}
            color={CVS_CHART.color}
            ariaLabel={CVS_CHART.title}
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
          <Clock className="w-4 h-4 text-slate-400" />
          <h2 className="text-sm font-bold text-gray-700">Activité récente</h2>
        </div>
        <div className="divide-y divide-slate-50">
          {RECENT_ACTIVITY.map((a) => (
            <div key={a.id} className="flex items-center gap-3 px-5 py-3">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg shrink-0 ${TYPE_COLOR[a.type]}`}>
                {TYPE_LABEL[a.type]}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-700 truncate">{a.who}</p>
                <p className="text-xs text-slate-400 truncate">{a.action}</p>
              </div>
              <span className="text-[10px] text-slate-400 shrink-0">{a.time}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {SHORTCUTS.map((r) => {
          const Icon = SHORTCUT_ICONS[r.icon];
          return (
            <Link
              key={r.label}
              href={r.href}
              className="bg-white border border-slate-100 rounded-2xl p-4 flex flex-col items-center gap-2 hover:shadow-md hover:border-slate-200 transition-all text-center"
            >
              <div className={`w-10 h-10 rounded-xl ${r.bg} flex items-center justify-center ${r.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-slate-600">{r.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

