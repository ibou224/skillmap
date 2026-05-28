"use client";

import { useState, useEffect, useMemo } from "react";
import { Scale, Save, RotateCcw, AlertTriangle, Info, CheckCircle } from "lucide-react";

import { CRITERES } from "@/constants/constantes";
import { CritereCard } from "@/features/weights/CritereCard";
import { TotalIndicator } from "@/features/weights/TotalIndicator";
import { ScoreFormula } from "@/features/weights/ScoreFormula";
import { useWeights } from "@/hooks/useWeights";
import { useSessions } from "@/hooks/useSessions";

const DEFAULT_WEIGHTS = { competencesPct: 40, experiencePct: 25, formationPct: 20, historiquePct: 15 };

export default function WeightsConfigPage() {
  const { weights: allWeights, fetchWeights, updateWeight, isLoading: weightsLoading, error: weightsError } = useWeights();
  const { sessions, fetchSessions } = useSessions();

  const [selectedSession, setSelectedSession] = useState(null);
  const [draftWeights, setDraftWeights] = useState(null);
  const [editingField, setEditingField] = useState(null);
  const [tempWeights, setTempWeights] = useState(DEFAULT_WEIGHTS);
  const [hasChanges, setHasChanges] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    fetchWeights();
    fetchSessions();
  }, [fetchWeights, fetchSessions]);

  useEffect(() => {
    if (!selectedSession && sessions.length > 0) {
      setSelectedSession(sessions[0].id);
    }
  }, [selectedSession, sessions]);

  const baseWeights = useMemo(() => {
    const found = allWeights.find(w => w.sessionId === selectedSession);
    return found
      ? { competencesPct: found.competencesPct, experiencePct: found.experiencePct, formationPct: found.formationPct, historiquePct: found.historiquePct }
      : DEFAULT_WEIGHTS;
  }, [selectedSession, allWeights]);

  const weights = draftWeights ?? baseWeights;

  const total = Object.values(weights).reduce((sum, val) => sum + val, 0);
  const isValid = total === 100;
  const currentSession = sessions.find(s => s.id === selectedSession);

  const startEdit = (field) => {
    setEditingField(field);
    setTempWeights({ ...weights });
  };

  const cancelEdit = () => setEditingField(null);

  const saveField = (field) => {
    setDraftWeights({ ...weights, [field]: tempWeights[field] });
    setEditingField(null);
    setHasChanges(true);
  };

  const updateTempWeight = (field, value) => {
    setTempWeights({ ...tempWeights, [field]: value });
  };

  const resetToDefaults = () => {
    setDraftWeights(DEFAULT_WEIGHTS);
    setTempWeights(DEFAULT_WEIGHTS);
    setHasChanges(true);
  };

  const saveConfiguration = async () => {
    setSaveError(null);
    setSaveSuccess(false);
    try {
      await updateWeight(selectedSession, weights);
      setHasChanges(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setSaveError(err.message ?? "Erreur lors de la sauvegarde.");
    }
  };

  const changeSession = (sessionId) => {
    setSelectedSession(sessionId);
    setEditingField(null);
    setDraftWeights(null); 
    setHasChanges(false);
    setSaveError(null);
  };

  return (
    <div className="space-y-6">

      {/* ─── En-tête ─── */}
      <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-[hsl(134,35%,45%)] to-[#135d55] px-8 py-8">
        <div className="pointer-events-none absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/10" />
        <div className="relative flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Scale className="w-5 h-5 text-white/70" />
              <p className="text-xs font-medium uppercase tracking-[0.15em] text-white/70">Configuration</p>
            </div>
            <h1 className="text-3xl font-bold text-white">Pondérations des critères</h1>
            <p className="text-sm text-white/70 mt-2 font-light">
              Configurez les poids de chaque critère pour l&apos;algorithme d&apos;affectation
            </p>
          </div>
        </div>
      </div>

      {/* ─── Alertes ─── */}
      {saveSuccess && (
        <div className="flex items-center gap-2 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-700 font-medium">
          <CheckCircle className="w-4 h-4" /> Configuration enregistrée avec succès.
        </div>
      )}
      {saveError && (
        <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          <AlertTriangle className="w-4 h-4" /> {saveError}
        </div>
      )}
      {weightsError && (
        <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          Impossible de charger les pondérations : <strong>{weightsError}</strong>
        </div>
      )}
      {hasChanges && isValid && !saveSuccess && (
        <div className="flex items-center gap-2 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700">
          <AlertTriangle className="w-4 h-4" />
          Pensez à enregistrer vos modifications avant de changer de page
        </div>
      )}

      {/* ─── Panneau principal : sessions + contenu ─── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

        {/* Onglets sessions */}
        <div className="border-b border-slate-200 px-6 py-4">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
            Session académique
          </p>
          <div className="flex gap-2 flex-wrap">
            {sessions.map((session) => (
              <button
                key={session.id}
                onClick={() => changeSession(session.id)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  selectedSession === session.id
                    ? "bg-cite-green text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {session.nom}
                {session.statut === "ACTIVE" && (
                  <span className="ml-2 w-1.5 h-1.5 rounded-full bg-white/80 inline-block" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Contenu de la session sélectionnée */}
        <div className="p-6 space-y-6">

          {/* Info session */}
          {currentSession && (
            <div className="flex items-center gap-2 px-4 py-3 bg-blue-50 rounded-xl border border-blue-100">
              <Info className="w-4 h-4 text-blue-600" />
              <p className="text-sm text-blue-700">
                Configuration pour la session <strong>{currentSession.nom}</strong>
                {currentSession.statut === "ACTIVE" && " (active)"}
              </p>
            </div>
          )}

          {/* Grille des critères */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(CRITERES).map(([key, config]) => (
              <CritereCard
                key={key}
                id={key}
                config={config}
                value={editingField === key ? tempWeights[key] : weights[key]}
                isEditing={editingField === key}
                onChange={(value) => updateTempWeight(key, value)}
                onStartEdit={() => startEdit(key)}
                onCancel={cancelEdit}
                onSave={() => saveField(key)}
                hasUnsavedChanges={hasChanges}
              />
            ))}
          </div>

          {/* Indicateur de total et Formule */}
          <TotalIndicator total={total} isValid={isValid} />
          <ScoreFormula weights={weights} />

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              onClick={resetToDefaults}
              className="inline-flex items-center gap-2 px-4 py-2.5 border border-slate-200 text-slate-600 text-sm font-medium rounded-xl hover:bg-slate-50 transition"
            >
              <RotateCcw className="w-4 h-4" />
              Valeurs par défaut
            </button>
            <button
              onClick={saveConfiguration}
              disabled={!isValid || !hasChanges}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-cite-green text-white text-sm font-semibold rounded-xl hover:bg-[#135d55] transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              <Save className="w-4 h-4" />
              Enregistrer la configuration
            </button>
          </div>

        </div>
      </div>

    </div>
  );
}