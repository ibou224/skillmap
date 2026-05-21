"use client";

import { useState, useEffect, useMemo } from "react";
import { Scale, Save, RotateCcw, AlertTriangle, Info, CheckCircle } from "lucide-react";

import { CRITERES, SESSIONS_MOCK } from "@/constants/constantes";
import { CritereCard } from "./component/CritereCard";
import { TotalIndicator } from "./component/TotalIndicator";
import { ScoreFormula } from "./component/ScoreFormula";
import { useWeights } from "@/hooks/useWeight";

const DEFAULT_WEIGHTS = { competencesPct: 40, experiencePct: 25, formationPct: 20, historiquePct: 15 };

export default function WeightsConfigPage() {
  const { weights: allWeights, fetchWeights, updateWeight } = useWeights();

  const [selectedSession, setSelectedSession] = useState(SESSIONS_MOCK[0].id);
  const [draftWeights, setDraftWeights] = useState(null);
  const [editingField, setEditingField] = useState(null);
  const [tempWeights, setTempWeights] = useState(DEFAULT_WEIGHTS);
  const [hasChanges, setHasChanges] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Charge les poids au montage
  useEffect(() => { fetchWeights(); }, [fetchWeights]);

  const baseWeights = useMemo(() => {
    const found = allWeights.find(w => w.sessionId === selectedSession);
    return found
      ? { competencesPct: found.competencesPct, experiencePct: found.experiencePct, formationPct: found.formationPct, historiquePct: found.historiquePct }
      : DEFAULT_WEIGHTS;
  }, [selectedSession, allWeights]);

  const weights = draftWeights ?? baseWeights;

  const total = Object.values(weights).reduce((sum, val) => sum + val, 0);
  const isValid = total === 100;
  const currentSession = SESSIONS_MOCK.find(s => s.id === selectedSession);

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
    setDraftWeights(null); // recharge les poids depuis l'API pour la nouvelle session
    setHasChanges(false);
    setSaveError(null);
  };

  return (
    <div className="space-y-6 mx-auto">
      
      {/* ─── En-tête ─── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 px-8 py-8">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:20px_20px]" />
        <div className="pointer-events-none absolute -top-24 -right-24 w-64 h-64 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 blur-3xl" />
        
        <div className="relative">
          <div className="flex items-center gap-2 mb-3">
            <Scale className="w-5 h-5 text-blue-400" />
            <p className="text-xs font-medium uppercase tracking-[0.15em] text-blue-400">Configuration</p>
          </div>
          <h1 className="text-3xl font-bold text-white">Pondérations des critères</h1>
          <p className="text-sm text-slate-400 mt-2 font-light">
            Configurez les poids de chaque critère pour l'algorithme d'affectation
          </p>
        </div>
      </div>

      {/* ─── Sélecteur de session ─── */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
          Session académique
        </label>
        <div className="flex gap-2 flex-wrap">
          {SESSIONS_MOCK.map((session) => (
            <button
              key={session.id}
              onClick={() => changeSession(session.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                selectedSession === session.id
                  ? "bg-slate-800 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {session.nom}
              {session.statut === "ACTIVE" && (
                <span className="ml-2 w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Info session ─── */}
      {currentSession && (
        <div className="flex items-center gap-2 px-4 py-3 bg-blue-50 rounded-xl border border-blue-100">
          <Info className="w-4 h-4 text-blue-600" />
          <p className="text-sm text-blue-700">
            Configuration pour la session <strong>{currentSession.nom}</strong>
            {currentSession.statut === "ACTIVE" && " (active)"}
          </p>
        </div>
      )}

      {/* ─── Grille des critères ─── */}
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

      {/* ─── Indicateur de total et Formule ─── */}
      <TotalIndicator total={total} isValid={isValid} />
      <ScoreFormula weights={weights} />

      {/* ─── Actions ─── */}
      <div className="flex items-center justify-end gap-3">
        <button
          onClick={resetToDefaults}
          className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          Valeurs par défaut
        </button>
        <button
          onClick={saveConfiguration}
          disabled={!isValid || !hasChanges}
          className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-slate-800 hover:bg-slate-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm"
        >
          <Save className="w-4 h-4" />
          Enregistrer la configuration
        </button>
      </div>

      {saveSuccess && (
        <div className="flex items-center gap-2 px-4 py-3 bg-emerald-50 rounded-xl border border-emerald-100">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <p className="text-sm text-emerald-700">Configuration enregistrée avec succès.</p>
        </div>
      )}
      {saveError && (
        <div className="flex items-center gap-2 px-4 py-3 bg-red-50 rounded-xl border border-red-100">
          <AlertTriangle className="w-4 h-4 text-red-600" />
          <p className="text-sm text-red-700">{saveError}</p>
        </div>
      )}
      {hasChanges && isValid && !saveSuccess && (
        <div className="flex items-center gap-2 px-4 py-3 bg-amber-50 rounded-xl border border-amber-100">
          <AlertTriangle className="w-4 h-4 text-amber-600" />
          <p className="text-sm text-amber-700">
            Pensez à enregistrer vos modifications avant de changer de page
          </p>
        </div>
      )}
    </div>
  );
}