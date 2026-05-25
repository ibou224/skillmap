"use client";

import { useEffect, useState, useCallback } from "react";
import { Search, RefreshCw, AlertCircle, CheckCircle2, FileText, Filter } from "lucide-react";

const CV_STATUT_STYLE = {
  VALIDATED: { bg: "bg-emerald-50", text: "text-emerald-700", label: "Validé" },
  EXTRACTED: { bg: "bg-amber-50",   text: "text-amber-700",   label: "À valider" },
  PENDING:   { bg: "bg-blue-50",    text: "text-blue-700",    label: "En cours" },
};


export default function RhCvsPage() {
  const [professors, setProfessors] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [search, setSearch]         = useState("");
  const [filter, setFilter]         = useState("tous");

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

  const filtered = professors.filter((p) => {
    const q = search.toLowerCase();
    const matchSearch = `${p.prenom} ${p.nom} ${p.email}`.toLowerCase().includes(q);
    const matchFilter =
      filter === "tous" ||
      (filter === "aucun" && !p.cvStatut) ||
      p.cvStatut === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="space-y-6">
      {/* Bannière */}
      <div className="relative overflow-hidden rounded-3xl p-8 shadow-lg bg-linear-to-br from-[hsl(134,35%,45%)] to-[#135d55]">
        <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white/10 pointer-events-none" />
        <div className="relative">
          <h1 className="text-2xl sm:text-3xl font-black text-white">Gestion des CVs</h1>
          <p className="text-white/70 text-sm mt-1">Validez les CVs extraits par l&apos;IA</p>
        </div>
      </div>

      {/* Barre d'outils */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un professeur…"
            className="w-full pl-11 pr-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition bg-white"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="py-3 px-4 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 bg-white"
          >
            <option value="tous">Tous</option>
            <option value="EXTRACTED">À valider</option>
            <option value="VALIDATED">Validés</option>
            <option value="PENDING">En cours</option>
            <option value="aucun">Sans CV</option>
          </select>
        </div>
        <button
          onClick={fetchProfessors}
          disabled={loading}
          className="px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition disabled:opacity-50 flex items-center gap-2 text-sm"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Actualiser
        </button>
      </div>

      {/* Contenu */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 gap-2 text-slate-400">
            <RefreshCw size={18} className="animate-spin" />
            <span className="text-sm">Chargement…</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center py-16 gap-3 text-red-500">
            <AlertCircle size={24} />
            <p className="text-sm">{error}</p>
            <button onClick={fetchProfessors} className="text-xs px-3 py-1.5 bg-red-50 rounded-lg hover:bg-red-100 transition">
              Réessayer
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <FileText className="w-10 h-10 text-slate-200 mx-auto mb-3" />
            <p className="text-sm text-slate-400">Aucun résultat</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-slate-100 bg-slate-50/60">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Professeur</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide hidden sm:table-cell">Fichier</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Statut</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((prof) => {
                const badge = CV_STATUT_STYLE[prof.cvStatut] ?? { bg: "bg-slate-100", text: "text-slate-500", label: "Aucun CV" };
                return (
                  <tr key={prof.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-800">{prof.prenom} {prof.nom}</p>
                      <p className="text-xs text-slate-400">{prof.email}</p>
                    </td>
                    <td className="px-6 py-4 hidden sm:table-cell">
                      <p className="text-slate-600 truncate max-w-[200px]">{prof.cvFileName ?? "—"}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full ${badge.bg} ${badge.text}`}>
                        {badge.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {prof.cvStatut === "EXTRACTED" ? (
                        <ValidateButton cvId={prof.cvId} onValidated={fetchProfessors} />
                      ) : prof.cvStatut === "VALIDATED" ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 ml-auto" />
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function ValidateButton({ cvId, onValidated }) {
  const [loading, setLoading] = useState(false);
  const [done, setDone]       = useState(false);

  const handleValidate = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/cvs/${cvId}/validate`, { method: "PUT" });
      if (!res.ok) throw new Error();
      setDone(true);
      onValidated();
    } catch {
      alert("Erreur lors de la validation.");
    } finally {
      setLoading(false);
    }
  };

  if (done) return <CheckCircle2 className="w-4 h-4 text-emerald-500 ml-auto" />;

  return (
    <button
      onClick={handleValidate}
      disabled={loading}
      className="px-3 py-1.5 text-xs font-bold text-white bg-[hsl(134,35%,45%)] rounded-lg hover:bg-[hsl(134,35%,35%)] transition disabled:opacity-50 ml-auto block"
    >
      {loading ? "…" : "Valider le CV"}
    </button>
  );
}