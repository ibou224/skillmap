"use client";

import { BookOpen, Calendar, CheckCircle2, Layers } from "lucide-react";
import { StatCell } from "@/components/ui/StatCell";

export default function HistoryStats({ sessionsCount, assignments }) {
  const finalized = assignments.filter((item) => item.statut === "FINALISEE").length;
  const programs = new Set(
    assignments.flatMap((item) => item.course.programs?.map((program) => program.code) ?? [])
  );

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <StatCell icon={Calendar} label="Sessions" value={sessionsCount} />
      <StatCell icon={BookOpen} label="Affectations" value={assignments.length} />
      <StatCell icon={CheckCircle2} label="Finalisees" value={finalized} />
      <StatCell icon={Layers} label="Programmes" value={programs.size} />
    </div>
  );
}
