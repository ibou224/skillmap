import { Calendar, BookOpen, CheckCircle2, Layers } from "lucide-react";
import { StatCell } from "@/components/ui/StatCell";

export function HistoryStats({ nbSessions, nbCours, nbFinalise, nbProgs }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <StatCell icon={Calendar}     label="Sessions"   value={nbSessions}  />
      <StatCell icon={BookOpen}     label="Cours total" value={nbCours}    />
      <StatCell icon={CheckCircle2} label="Finalisés"  value={nbFinalise}  />
      <StatCell icon={Layers}       label="Programmes"  value={nbProgs}    />
    </div>
  );
}
