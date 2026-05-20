import { BookOpen, Layers } from "lucide-react";
import { Badge, StatusBadge } from "@/components/ui/Badge";

export function CourseRow({ code, nom, programme, etape, statut }) {
  return (
    <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
      <td className="px-5 py-3 font-mono text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
        {code}
      </td>
      <td className="px-5 py-3">
        <div className="flex items-center gap-2">
          <BookOpen className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 group-hover:text-slate-400 dark:group-hover:text-slate-500 transition-colors" />
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{nom}</span>
        </div>
      </td>
      <td className="px-5 py-3">
        <Badge>{programme}</Badge>
      </td>
      <td className="px-5 py-3">
        <Badge className="border-purple-200 bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800">
          <Layers className="w-3 h-3" /> Étape {etape}
        </Badge>
      </td>
      <td className="px-5 py-3">
        <StatusBadge statut={statut} />
      </td>
    </tr>
  );
}