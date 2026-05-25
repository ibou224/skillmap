"use client";

import { useEffect } from "react";
import { StatCard } from "../components/StatCard";
import {
  FileText,
  Clock,
  CheckCircle,
  TrendingUp,
  ChevronRight,
  RefreshCw,
  UploadCloud,
} from "lucide-react";
import Link from "next/link";
import { useCvs } from "@/hooks/useProfessor";

const STATUT_STYLE = {
  FINALISEE: { bg: "bg-emerald-50", text: "text-emerald-600", label: "Finalisée" },
  AJUSTEE:   { bg: "bg-blue-50",    text: "text-blue-600",    label: "Ajustée"   },
  PROPOSEE:  { bg: "bg-amber-50",   text: "text-amber-600",   label: "Proposée"  },
};

export default function HomeSection() {
  const {
    infos,
    isLoadingInfos,
    fetchInfos,
    affectations,
    isLoadingAffectations,
    fetchAffectations,
  } = useCvs();

  useEffect(() => {
    fetchInfos();
    fetchAffectations();
  }, [fetchInfos, fetchAffectations]);

  // Affectations de la session active uniquement
  const affectationsActives = (affectations ?? []).filter(
    (a) => a.session?.statut === "ACTIVE"
  );

  const sessionActive = affectationsActives[0]?.session ?? null;

  const nom = infos ? `${infos.prenom ?? ""} ${infos.nom ?? ""}`.trim() : "…";

  const cvStatut = infos?.cvStatut ?? null;

  const statusBadge = {
    VALIDATED: { bg: "bg-emerald-100", text: "text-emerald-700", label: "CV validé" },
    EXTRACTED: { bg: "bg-amber-100",   text: "text-amber-700",   label: "En attente de validation" },
    PENDING:   { bg: "bg-slate-100",   text: "text-slate-600",   label: "Extraction en cours" },
  }[cvStatut] ?? { bg: "bg-slate-100", text: "text-slate-500", label: "CV non soumis" };

  return (
    <div className="space-y-6">

      {/* ── Bannière ── */}
      <div className="relative overflow-hidden rounded-3xl p-8 shadow-lg bg-gradient-to-br from-[hsl(134,35%,45%)] to-[#135d55]">
        <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white/10 pointer-events-none" />
        <div className="absolute -bottom-12 -left-8 w-36 h-36 rounded-full bg-white/5 pointer-events-none" />
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            {isLoadingInfos ? (
              <div className="h-8 w-48 bg-white/20 rounded-xl animate-pulse" />
            ) : (
              <h1 className="text-2xl sm:text-3xl font-black text-white">
                {nom ? `Bonjour, ${nom}` : "Bienvenue !"}
              </h1>
            )}
            <p className="text-white/70 text-sm mt-1">Tableau de bord professeur</p>
          </div>
          <span className={`self-start px-4 py-2 rounded-full text-xs font-bold ${statusBadge.bg} ${statusBadge.text}`}>
            {statusBadge.label}
          </span>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={CheckCircle} label="Compétences"        value={infos?.competences?.length ?? "—"} color="emerald" />
        <StatCard icon={FileText}    label="Expériences"        value={infos?.experiences?.length ?? "—"} color="blue"    />
        <StatCard icon={TrendingUp}  label="Formations"         value={infos?.formations?.length  ?? "—"} color="purple"  />
        <StatCard icon={Clock}       label="Affectations actives" value={affectationsActives.length}      color="amber"   />
      </div>

      {/* ── Affectations session active ── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-gray-800">Mes affectations</h2>
            <p className="text-xs text-slate-400">
              {sessionActive ? `Session ${sessionActive.nom}` : "Aucune session active"}
            </p>
          </div>
          <Link
            href="/dashboard/professeur/affectations"
            className="text-xs font-medium text-[hsl(134,35%,45%)] hover:underline flex items-center gap-1"
          >
            Voir tout <ChevronRight className="w-3 h-3" />
          </Link>
        </div>

        {isLoadingAffectations ? (
          <div className="flex items-center justify-center py-12 gap-2 text-slate-400">
            <RefreshCw size={18} className="animate-spin" />
            <span className="text-sm">Chargement…</span>
          </div>
        ) : affectationsActives.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3 text-slate-400">
            <Clock className="w-8 h-8 text-slate-200" />
            <p className="text-sm">Aucune affectation pour la session active.</p>
            <Link
              href="/dashboard/professeur/cv"
              className="flex items-center gap-1 text-xs font-semibold text-[hsl(134,35%,45%)] hover:underline"
            >
              <UploadCloud className="w-3.5 h-3.5" /> Soumettre mon CV
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {affectationsActives.map((aff) => {
              const s = STATUT_STYLE[aff.statut] ?? STATUT_STYLE.PROPOSEE;
              return (
                <div
                  key={aff.id}
                  className="px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between hover:bg-slate-50/80 transition-colors gap-2"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-800">
                        {aff.course?.nom}
                      </span>
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-blue-50 text-blue-600">
                        {aff.course?.programs?.[0]?.code ?? "—"}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{aff.course?.code}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full ${s.bg} ${s.text}`}>
                      {s.label}
                    </span>
                    <span className="text-sm font-black text-emerald-600">
                      {Math.round((aff.score ?? 0) * 100)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}