import { Calendar, CheckCircle2, BookOpen, Layers } from "lucide-react";

function StatCell({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 p-4 bg-slate-700/50 rounded-lg">
      <div className="w-12 h-12 rounded-lg bg-slate-700/30 flex items-center justify-center"></div>
        <Icon className="w-5 h-5 text-emerald-400" />
        <div>
            <p className="text-sm text-slate-400">{label}</p>
            <p className="text-2xl font-bold text-white">{value}</p>
        </div> 
    </div>     
  );
}

export default function HistoryStats({ stats }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <StatCell icon={Calendar} label="Sessions" value={stats.sessions} />
      <StatCell icon={BookOpen} label="Cours total" value={stats.totalCours} />
      <StatCell icon={CheckCircle2} label="Finalisés" value={stats.finalises} />
      <StatCell icon={Layers} label="Programmes" value={stats.programmes} />
    </div>
  );
}