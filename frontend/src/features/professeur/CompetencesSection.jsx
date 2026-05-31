"use client";

/**
 * @module features/professeur/CompetencesSection
 * @description Section professeur d'édition des compétences avec statistiques par
 * niveau, via {@link module:hooks/useProfessor}.
 * @returns {ReactNode} La section des compétences du professeur.
 */

import { useState, useEffect } from "react";
import { Save, RefreshCw, CheckCircle2, AlertCircle, Lightbulb } from "lucide-react";
import { useCvs } from "@/hooks/useProfessor";
import { SkillsEditor } from "@/components/professeur/skills/SkillsEditor";

/** Niveaux de compétence et leurs styles (bar/badge). */
const NIVEAU_STATS = [
  { key: "DEBUTANT",      label: "Débutant",      bar: "bg-slate-400",    badge: "bg-slate-100 text-slate-600"    },
  { key: "INTERMEDIAIRE", label: "Intermédiaire",  bar: "bg-blue-500",     badge: "bg-blue-50 text-blue-700"       },
  { key: "AVANCE",        label: "Avancé",         bar: "bg-emerald-500",  badge: "bg-emerald-50 text-emerald-700" },
];

export default function CompetencesSection() {
  const { infos, isLoadingInfos: loading, infosError: loadError, fetchInfos, saveInfos, isSaving } = useCvs();

  const [competences, setCompetences] = useState([]);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError]     = useState(null);
  const [prevInfos, setPrevInfos]     = useState(null);

  useEffect(() => { fetchInfos(); }, [fetchInfos]);

  if (infos !== prevInfos && infos?.competences) {
    setPrevInfos(infos);
    setCompetences(
      infos.competences.map((c) =>
        typeof c === "string" ? { nom: c, niveau: "DEBUTANT" } : { nom: c.nom, niveau: c.niveau ?? "DEBUTANT" }
      )
    );
  }

  const handleSave = async () => {
    setSaveError(null);
    setSaveSuccess(false);
    try {
      await saveInfos({
        competences: competences
          .map((c) => ({ nom: c.nom.trim(), niveau: c.niveau, categorie: "autre", anneesExp: 0, source: "SAISIE_MANUELLE" }))
          .filter((c) => c.nom !== ""),
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setSaveError(err.message || "Erreur lors de la sauvegarde.");
      setTimeout(() => setSaveError(null), 4000);
    }
  };

  const statCounts = NIVEAU_STATS.map((s) => ({
    ...s,
    count: competences.filter((c) => c.niveau === s.key).length,
  }));

  return (
    <div className="space-y-5">

      {/* ── Banner ── */}
      <div className="relative overflow-hidden rounded-3xl p-8 shadow-lg bg-linear-to-br from-[hsl(134,35%,45%)] to-[#135d55]">
        <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white/10 pointer-events-none" />
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="w-5 h-5 text-white/70" />
              <p className="text-xs font-medium uppercase tracking-[0.15em] text-white/70">Professeur</p>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">Mes compétences</h1>
            <p className="text-white/70 text-sm mt-1">
              Ajoutez, modifiez ou supprimez vos compétences et précisez votre niveau.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-4 py-2 rounded-full text-xs font-bold bg-white/20 text-white">
              {competences.length} compétence{competences.length !== 1 ? "s" : ""}
            </span>
            <button
              onClick={fetchInfos}
              disabled={loading}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-white text-sm font-medium flex items-center gap-2 transition disabled:opacity-50"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              Actualiser
            </button>
          </div>
        </div>
      </div>

      {/* ── Stats niveaux ── */}
      {competences.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {statCounts.map(({ label, bar, badge, count }) => (
            <div key={label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
              <div className="flex items-center justify-between mb-3">
                <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${badge}`}>{label}</span>
                <span className="text-2xl font-black text-slate-800">{count}</span>
              </div>
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${bar}`}
                  style={{ width: competences.length > 0 ? `${(count / competences.length) * 100}%` : "0%" }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Éditeur ── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-5">
          {loading ? (
            <div className="flex items-center justify-center py-12 gap-2 text-slate-400">
              <RefreshCw size={18} className="animate-spin" />
              <span className="text-sm">Chargement…</span>
            </div>
          ) : loadError ? (
            <div className="flex flex-col items-center py-12 gap-3 text-red-500">
              <AlertCircle size={24} />
              <p className="text-sm">{loadError?.message ?? "Erreur de chargement"}</p>
              <button onClick={fetchInfos} className="text-xs px-3 py-1.5 bg-red-50 rounded-lg hover:bg-red-100 transition">
                Réessayer
              </button>
            </div>
          ) : (
            <SkillsEditor items={competences} onChange={setCompetences} />
          )}
        </div>

        {/* Feedback */}
        {saveSuccess && (
          <div className="mx-6 mb-4 px-4 py-2.5 bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm font-medium rounded-xl flex items-center gap-2">
            <CheckCircle2 size={16} /> Compétences sauvegardées avec succès.
          </div>
        )}
        {saveError && (
          <div className="mx-6 mb-4 px-4 py-2.5 bg-red-50 border border-red-100 text-red-700 text-sm font-medium rounded-xl flex items-center gap-2">
            <AlertCircle size={16} /> {saveError}
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-end">
          <button
            onClick={handleSave}
            disabled={isSaving || loading}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-[hsl(134,35%,45%)] rounded-xl hover:bg-[hsl(134,35%,35%)] transition disabled:opacity-50"
          >
            {isSaving ? <RefreshCw size={15} className="animate-spin" /> : <Save size={15} />}
            {isSaving ? "Sauvegarde…" : "Sauvegarder"}
          </button>
        </div>
      </div>
    </div>
  );
}
