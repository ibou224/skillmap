import { BookOpen, CheckCircle2, Edit3, Clock } from "lucide-react";
import { StatCell } from "@/components/ui/StatCell";

export default function AffStats({ proposals }) {
  const total      = proposals.length;
  const proposees  = proposals.filter((p) => p.statut === "PROPOSEE").length;
  const ajustees   = proposals.filter((p) => p.statut === "AJUSTEE").length;
  const finalisees = proposals.filter((p) => p.statut === "FINALISEE").length;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <StatCell icon={BookOpen}     label="Total"       value={total}      />
      <StatCell icon={Clock}        label="Proposées"   value={proposees}  />
      <StatCell icon={Edit3}        label="Ajustées"    value={ajustees}   />
      <StatCell icon={CheckCircle2} label="Finalisées"  value={finalisees} />
    </div>
  );
}
