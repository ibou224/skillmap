import { TrendingUp } from "lucide-react";

export function StatCell({ icon: Icon, label, value, trend }) {
  return (
    <div className="flex items-center gap-3 p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 transition-colors">
      <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
        <Icon className="w-5 h-5 text-slate-400 dark:text-slate-500" />
      </div>
      <div>
        <p className="text-2xl font-semibold text-slate-800 dark:text-slate-200">{value}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
      </div>
      {trend !== undefined && (
        <TrendingUp className={`w-4 h-4 ml-auto ${trend >= 0 ? 'text-emerald-500' : 'text-red-500'}`} />
      )}
    </div>
  );
}