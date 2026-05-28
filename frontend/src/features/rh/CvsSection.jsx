"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import {
  Search, RefreshCw, AlertCircle, FileText,
  ChevronLeft, ChevronRight, Eye, ArrowUpDown,
  Users, FileCheck, FileClock, FileX, CheckCircle2,
  Lightbulb, Briefcase, GraduationCap, UserX,
} from "lucide-react";
import { FILTER_TABS, SORT_OPTIONS, formatDate, getStatutMeta } from "../../constants/cvConstantes";
import StatCard from "../../components/cv/StatCard";
import MiniCount from "../../components/cv/MiniCount";
import CvModal from "../../components/cv/CvModal";
import {useCvs} from "@/hooks/useProfessor";


const PAGE_SIZE = 12;

export default function CvsSection() {
  const { professors, loading, error, fetchProfessors } = useCvs();
  const [selectedProfId, setSelectedProfId] = useState(null);
  const [search, setSearch]         = useState("");
  const [filter, setFilter]         = useState("tous");
  const [sort, setSort]             = useState("nom_asc");
  const [page, setPage]             = useState(1);

  useEffect(() => { fetchProfessors(); }, [fetchProfessors]);

  const stats = useMemo(() => ({
    total:      professors.length,
    validated:  professors.filter((p) => p.cvStatut === "VALIDATED").length,
    toValidate: professors.filter((p) => p.cvStatut === "EXTRACTED").length,
    noCv:       professors.filter((p) => !p.cvStatut).length,
  }), [professors]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return professors.filter((p) => {
      const matchSearch = `${p.prenom} ${p.nom} ${p.email}`.toLowerCase().includes(q);
      const matchFilter =
        filter === "tous"   ? true :
        filter === "aucun"  ? !p.cvStatut :
        p.cvStatut === filter;
      return matchSearch && matchFilter;
    });
  }, [professors, search, filter]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      if (sort === "nom_asc")   return `${a.prenom} ${a.nom}`.localeCompare(`${b.prenom} ${b.nom}`);
      if (sort === "nom_desc")  return `${b.prenom} ${b.nom}`.localeCompare(`${a.prenom} ${a.nom}`);
      if (sort === "cv_recent") return (new Date(b.cvCreatedAt ?? 0)) - (new Date(a.cvCreatedAt ?? 0));
      if (sort === "cv_ancien") return (new Date(a.cvCreatedAt ?? 0)) - (new Date(b.cvCreatedAt ?? 0));
      return 0;
    });
  }, [filtered, sort]);

  const totalPages  = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated   = sorted.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleSearch = (v) => { setSearch(v); setPage(1); };
  const handleFilter = (v) => { setFilter(v); setPage(1); };

  const countByFilter = useMemo(() => ({
    tous:      professors.length,
    EXTRACTED: professors.filter((p) => p.cvStatut === "EXTRACTED").length,
    VALIDATED: professors.filter((p) => p.cvStatut === "VALIDATED").length,
    PENDING:   professors.filter((p) => p.cvStatut === "PENDING").length,
    aucun:     professors.filter((p) => !p.cvStatut).length,
  }), [professors]);

  return (
    <div className="space-y-6">

      {/* ── Bannière ── */}
      <div className="relative overflow-hidden rounded-3xl p-7 shadow-lg bg-linear-to-br from-[hsl(134,35%,45%)] to-[#135d55]">
        <div className="absolute -top-8 -right-8 w-48 h-48 rounded-full bg-white/10 pointer-events-none" />
        <div className="absolute -bottom-12 -left-8 w-40 h-40 rounded-full bg-white/5 pointer-events-none" />
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">Gestion des CVs</h1>
            <p className="text-white/70 text-sm mt-1">Suivi et validation des CVs professeurs</p>
          </div>
          <button
            onClick={fetchProfessors}
            disabled={loading}
            className="self-start sm:self-auto px-4 py-2.5 bg-white/20 hover:bg-white/30 rounded-xl text-white text-sm font-medium flex items-center gap-2 transition disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Actualiser
          </button>
        </div>
      </div>

      {/* ── Cartes stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users}      label="Professeurs"  value={loading ? "—" : stats.total}      colorBg="bg-slate-100"   colorIcon="text-slate-500"   />
        <StatCard icon={FileCheck}  label="CVs validés"  value={loading ? "—" : stats.validated}  colorBg="bg-emerald-50"  colorIcon="text-emerald-500" />
        <StatCard icon={FileClock}  label="À valider"    value={loading ? "—" : stats.toValidate} colorBg="bg-amber-50"    colorIcon="text-amber-500"   />
        <StatCard icon={FileX}      label="Sans CV"      value={loading ? "—" : stats.noCv}       colorBg="bg-red-50"      colorIcon="text-red-400"     />
      </div>

      {/* ── Barre de filtres ── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-3">

        {/* Ligne 1 : recherche + tri + refresh */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Rechercher par nom, prénom ou email…"
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition"
            />
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <ArrowUpDown className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="py-2.5 px-3 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Ligne 2 : filtres pilules */}
        <div className="flex flex-wrap gap-2">
          {FILTER_TABS.map((tab) => {
            const count   = countByFilter[tab.value] ?? 0;
            const active  = filter === tab.value;
            return (
              <button
                key={tab.value}
                onClick={() => handleFilter(tab.value)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition
                  ${active
                    ? "bg-[hsl(134,35%,45%)] text-white border-[hsl(134,35%,45%)] shadow-sm"
                    : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                  }`}
              >
                {tab.label}
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold tabular-nums
                  ${active ? "bg-white/25 text-white" : "bg-slate-100 text-slate-500"}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Table ── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20 gap-3 text-slate-400">
            <RefreshCw size={20} className="animate-spin text-emerald-500" />
            <span className="text-sm font-medium">Chargement…</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center py-20 gap-3">
            <AlertCircle size={28} className="text-red-400" />
            <p className="text-sm text-red-500 font-medium">{error}</p>
            <button
              onClick={fetchProfessors}
              className="text-xs px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition font-medium"
            >
              Réessayer
            </button>
          </div>
        ) : sorted.length === 0 ? (
          <div className="flex flex-col items-center py-20 gap-3">
            <FileText className="w-12 h-12 text-slate-200" />
            <p className="text-sm font-semibold text-slate-400">Aucun résultat</p>
            <p className="text-xs text-slate-300">
              {search ? `Aucun professeur ne correspond à "${search}"` : "Aucun professeur dans cette catégorie"}
            </p>
            {search && (
              <button onClick={() => handleSearch("")} className="text-xs px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-xl transition">
                Effacer la recherche
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-100 bg-slate-50/60">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wide">Professeur</th>
                  <th className="px-5 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wide hidden md:table-cell">Profil</th>
                  <th className="px-5 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wide hidden lg:table-cell">Fichier</th>
                  <th className="px-5 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wide hidden lg:table-cell">Date CV</th>
                  <th className="px-5 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wide">Statut</th>
                  <th className="px-5 py-3 text-right text-xs font-bold text-slate-400 uppercase tracking-wide">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {paginated.map((prof) => {
                  const meta   = getStatutMeta(prof.cvStatut);
                  const inactive = !prof.isActive;
                  return (
                    <tr
                      key={prof.id}
                      className={`transition-colors ${inactive ? "opacity-50 bg-slate-50/50" : "hover:bg-slate-50/60"}`}
                    >
                      {/* Nom */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-xs font-bold text-[hsl(134,35%,45%)] shrink-0 uppercase">
                            {prof.prenom?.[0]}{prof.nom?.[0]}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className="font-semibold text-gray-800 truncate">{prof.prenom} {prof.nom}</p>
                            </div>
                            <p className="text-xs text-slate-400 truncate">{prof.email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 hidden md:table-cell">
                        <div className="flex flex-wrap gap-1">
                          <MiniCount icon={Lightbulb}     value={prof.competences} color="bg-purple-50 text-purple-600" />
                          <MiniCount icon={Briefcase}     value={prof.experiences} color="bg-blue-50 text-blue-600"     />
                          <MiniCount icon={GraduationCap} value={prof.formations}  color="bg-teal-50 text-teal-600"     />
                          {prof.competences === 0 && prof.experiences === 0 && prof.formations === 0 && (
                            <span className="text-xs text-slate-300">—</span>
                          )}
                        </div>
                      </td>

                      {/* Fichier */}
                      <td className="px-5 py-4 hidden lg:table-cell">
                        <p className="text-slate-500 text-xs truncate max-w-45" title={prof.cvFileName ?? ""}>
                          {prof.cvFileName ?? <span className="text-slate-300">—</span>}
                        </p>
                      </td>

                      {/* Date CV */}
                      <td className="px-5 py-4 hidden lg:table-cell">
                        <div className="text-xs text-slate-500 space-y-0.5">
                          {prof.cvCreatedAt && (
                            <p>Soumis le  <span className="font-medium">{formatDate(prof.cvCreatedAt)}</span></p>
                          )}
                          {!prof.cvCreatedAt && <span className="text-slate-300">—</span>}
                        </div>
                      </td>

                      {/* Statut */}
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold rounded-full ${meta.bg} ${meta.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${meta.dot}`} />
                          {meta.label}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => setSelectedProfId(prof.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition bg-slate-100 hover:bg-slate-200 text-slate-600"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Voir
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer table */}
        {!loading && !error && sorted.length > 0 && (
          <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/40 flex items-center justify-between">
            <p className="text-xs text-slate-400">
              {sorted.length} résultat{sorted.length > 1 ? "s" : ""}
              {search && <span> pour « <span className="font-medium text-slate-600">{search}</span> »</span>}
            </p>
            <p className="text-xs text-slate-400">
              Page {currentPage} / {totalPages}
            </p>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={currentPage <= 1}
            className="p-2 rounded-xl hover:bg-slate-100 disabled:opacity-30 transition"
          >
            <ChevronLeft className="w-4 h-4 text-slate-500" />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
            .reduce((acc, p, i, arr) => {
              if (i > 0 && p - arr[i - 1] > 1) acc.push("…");
              acc.push(p);
              return acc;
            }, [])
            .map((p, i) =>
              p === "…" ? (
                <span key={`e-${i}`} className="w-8 text-center text-slate-400 text-sm">…</span>
              ) : (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-8 h-8 rounded-xl text-xs font-bold transition
                    ${p === currentPage
                      ? "bg-[hsl(134,35%,45%)] text-white shadow-sm"
                      : "hover:bg-slate-100 text-slate-500"
                    }`}
                >
                  {p}
                </button>
              )
            )}

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage >= totalPages}
            className="p-2 rounded-xl hover:bg-slate-100 disabled:opacity-30 transition"
          >
            <ChevronRight className="w-4 h-4 text-slate-500" />
          </button>
        </div>
      )}

      {/* ── Modal CV ── */}
      {selectedProfId && (
        <CvModal
          professorId={selectedProfId}
          onClose={() => setSelectedProfId(null)}
        />
      )}
    </div>
  );
}
