"use client";

import { useState, useEffect } from "react";
import { Save, RefreshCw, CheckCircle2, AlertCircle } from "lucide-react";
import { useCvs } from "@/hooks/useProfessor";
import { SkillsEditor } from "../components/SkillsEditor";

export default function CompetencesSection() {
  const {
    infos,
    isLoadingInfos: loading,
    infosError: loadError,
    fetchInfos,
    saveInfos,
    isSaving,
  } = useCvs();

  const [competences, setCompetences] = useState([]);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError]     = useState(null);

  // Initialiser les compétences dès que le profil est chargé
  useEffect(() => {
    fetchInfos();
  }, [fetchInfos]);

  useEffect(() => {
    if (infos?.competences) {
      setCompetences(
        infos.competences.map((c) =>
          typeof c === "string"
            ? { nom: c, niveau: "DEBUTANT" }
            : { nom: c.nom, niveau: c.niveau ?? "DEBUTANT" }
        )
      );
    }
  }, [infos]);

  const handleSave = async () => {
    setSaveError(null);
    setSaveSuccess(false);
    try {
      await saveInfos({
        competences: competences.map((c) => ({
          nom:       c.nom.trim(),
          niveau:    c.niveau,
          categorie: "autre",
          anneesExp: 0,
          source:    "SAISIE_MANUELLE",
        })).filter((c) => c.nom !== ""),
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setSaveError(err.message || "Erreur lors de la sauvegarde.");
      setTimeout(() => setSaveError(null), 4000);
    }
  };

  return (
    <div className="space-y-6">

      {/* ── Bannière ── */}
      <div className="relative overflow-hidden rounded-3xl p-8 shadow-lg bg-gradient-to-br from-[hsl(134,35%,45%)] to-[#135d55]">
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/10 pointer-events-none" />
        <h1 className="relative text-2xl sm:text-3xl font-black text-white">Mes compétences</h1>
        <p className="relative text-white/70 text-sm mt-1">
          Ajoutez, modifiez ou supprimez vos compétences et précisez votre niveau de maîtrise.
        </p>
      </div>

      {/* ── Contenu ── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">

        {/* En-tête carte */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <p className="text-sm font-semibold text-slate-700">
            {competences.length} compétence{competences.length !== 1 ? "s" : ""}
          </p>
          <button
            onClick={fetchInfos}
            disabled={loading}
            className="text-slate-400 hover:text-slate-600 disabled:opacity-50"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
        </div>

        {/* Corps */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12 gap-2 text-slate-400">
              <RefreshCw size={18} className="animate-spin" />
              <span className="text-sm">Chargement…</span>
            </div>
          ) : loadError ? (
            <div className="flex flex-col items-center py-12 gap-3 text-red-500">
              <AlertCircle size={24} />
              <p className="text-sm">{loadError?.message ?? "Erreur de chargement"}</p>
              <button
                onClick={fetchInfos}
                className="text-xs px-3 py-1.5 bg-red-50 rounded-lg hover:bg-red-100 transition"
              >
                Réessayer
              </button>
            </div>
          ) : (
            <SkillsEditor items={competences} onChange={setCompetences} />
          )}
        </div>

        {/* Feedbacks */}
        {saveSuccess && (
          <div className="mx-6 mb-4 px-4 py-2 bg-emerald-50 text-emerald-700 text-sm font-medium rounded-xl flex items-center gap-2">
            <CheckCircle2 size={16} /> Compétences sauvegardées avec succès.
          </div>
        )}
        {saveError && (
          <div className="mx-6 mb-4 px-4 py-2 bg-red-50 text-red-700 text-sm font-medium rounded-xl flex items-center gap-2">
            <AlertCircle size={16} /> {saveError}
          </div>
        )}

        {/* Pied de carte */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/40 flex justify-end">
          <button
            onClick={handleSave}
            disabled={isSaving || loading}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-[hsl(134,35%,45%)] rounded-xl hover:bg-[hsl(134,35%,35%)] transition disabled:opacity-50"
          >
            {isSaving ? (
              <RefreshCw size={15} className="animate-spin" />
            ) : (
              <Save size={15} />
            )}
            {isSaving ? "Sauvegarde…" : "Sauvegarder"}
          </button>
        </div>
      </div>
    </div>
  );
}