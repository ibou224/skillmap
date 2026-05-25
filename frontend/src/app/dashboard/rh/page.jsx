"use client";

import { useEffect, useState, useCallback } from "react";
import { Users, FileCheck, FileClock, FileX, ChevronRight, RefreshCw, AlertCircle, CheckCircle2 } from "lucide-react";
import Link from "next/link";

const CV_STATUT_STYLE = {
  VALIDATED: { bg: "bg-emerald-50", text: "text-emerald-700", label: "Validé" },
  EXTRACTED: { bg: "bg-amber-50",   text: "text-amber-700",   label: "À valider" },
  PENDING:   { bg: "bg-slate-100",  text: "text-slate-600",   label: "En attente" },
};

export default function RhDashboard() {
  const [professors, setProfessors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const fetchProfessors = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/rh/professors");
      if (!res.ok) throw new Error(`Erreur ${res.status}`);
      const { data } = await res.json();
      setProfessors(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProfessors(); }, [fetchProfessors]);

  const total      = professors.length;
  const validated  = professors.filter((p) => p.cvStatut === "VALIDATED").length;
  const toValidate = professors.filter((p) => p.cvStatut === "EXTRACTED").length;
  const noCv       = professors.filter((p) => !p.cvStatut).length;

  return (
    <div className="space-y-6">
      {/* Bannière */}
      <div className="relative overflow-hidden rounded-3xl p-8 shadow-lg bg-linear-to-br from-[hsl(134,35%,45%)] to-[#135d55]">
        <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white/10 pointer-events-none" />
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">Tableau de bord RH</h1>
            <p className="text-white/70 text-sm mt-1">Gestion des CVs et affectations</p>
          </div>
          <button
            onClick={fetchProfessors}
            disabled={loading}
            className="self-start px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-white text-sm font-medium flex items-center gap-2 transition disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Actualiser
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Users,      label: "Professeurs",  value: total,      color: "slate"   },
          { icon: FileCheck,  label: "CVs validés",  value: validated,  color: "emerald" },
          { icon: FileClock,  label: "À valider",    value: toValidate, color: "amber"   },
          { icon: FileX,      label: "Sans CV",      value: noCv,       color: "red"     },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl bg-${color}-50 flex items-center justify-center`}>
              <Icon className={`w-5 h-5 text-${color}-500`} />
            </div>
            <div>
              <p className="text-2xl font-black text-gray-800">{loading ? "—" : value}</p>
              <p className="text-xs text-slate-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Liste des professeurs */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-gray-800">Professeurs</h2>
          <Link
            href="/dashboard/rh/cvs"
            className="text-xs font-medium text-[hsl(134,35%,45%)] hover:underline flex items-center gap-1"
          >
            Gérer les CVs <ChevronRight className="w-3 h-3" />
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12 gap-2 text-slate-400">
            <RefreshCw size={18} className="animate-spin" />
            <span className="text-sm">Chargement…</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center py-12 gap-3 text-red-500">
            <AlertCircle size={24} />
            <p className="text-sm">{error}</p>
          </div>
        ) : professors.length === 0 ? (
          <p className="text-center py-12 text-sm text-slate-400">Aucun professeur trouvé.</p>
        ) : (
          <div className="divide-y divide-slate-50">
            {professors.map((prof) => {
              const badge = CV_STATUT_STYLE[prof.cvStatut] ?? { bg: "bg-slate-100", text: "text-slate-500", label: "Aucun CV" };
              return (
                <div key={prof.id} className="px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 hover:bg-slate-50/80 transition-colors">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">
                      {prof.prenom} {prof.nom}
                    </p>
                    <p className="text-xs text-slate-400">{prof.email}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full ${badge.bg} ${badge.text}`}>
                      {badge.label}
                    </span>
                    {prof.cvStatut === "EXTRACTED" && (
                      <ValidateButton cvId={prof.cvId} onValidated={fetchProfessors} />
                    )}
                    {prof.cvStatut === "VALIDATED" && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    )}
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

function ValidateButton({ cvId, onValidated }) {
  const [loading, setLoading] = useState(false);

  const handleValidate = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/cvs/${cvId}/validate`, { method: "PUT" });
      if (!res.ok) throw new Error();
      onValidated();
    } catch {
      alert("Erreur lors de la validation.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleValidate}
      disabled={loading}
      className="px-3 py-1 text-xs font-bold text-white bg-[hsl(134,35%,45%)] rounded-lg hover:bg-[hsl(134,35%,35%)] transition disabled:opacity-50"
    >
      {loading ? "…" : "Valider"}
    </button>
  );
}