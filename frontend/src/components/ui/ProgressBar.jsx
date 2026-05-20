export function ProgressBar({ pct }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
        <div 
          className="h-full bg-emerald-500 dark:bg-emerald-400 rounded-full transition-all duration-500" 
          style={{ width: `${pct}%` }} 
        />
      </div>
      <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">{pct}%</span>
    </div>
  );
}