"use client";

import { useState } from "react";
import { Settings2, CheckCircle2, Zap, RefreshCw } from "lucide-react";

export default function SettingsSection() {
  const [weights, setWeights] = useState([
    { key: "competences",  label: "Compétences techniques", description: "Correspondance entre les compétences du prof et celles requises par le cours", value: 40 },
    { key: "experience",   label: "Années d'expérience",    description: "Pondère l'expérience générale du professeur dans le domaine",                  value: 30 },
    { key: "historique",   label: "Historique de cours",    description: "Bonus si le prof a déjà enseigné ce cours ou un cours similaire",              value: 20 },
    { key: "disponibilite",label: "Disponibilité",          description: "Pénalise si le prof est déjà chargé à pleine capacité pour la session",        value: 10 },
  ]);

  const [model, setModel]         = useState("gpt-oss-ctx24k:120B");
  const [maxAffectations, setMax] = useState(4);
  const [seuilScore, setSeuil]    = useState(70);
  const [saved, setSaved]         = useState(false);

  const total = weights.reduce((sum, w) => sum + w.value, 0);

  const updateWeight = (key, val) => {
    setWeights((prev) => prev.map((w) => w.key === key ? { ...w, value: val } : w));
  };

  const normalize = () => {
    if (total === 0) return;
    const factor = 100 / total;
    setWeights((prev) => prev.map((w) => ({ ...w, value: Math.round(w.value * factor) })));
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const inputCls =
    "w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[hsl(134,35%,45%)] transition bg-white";

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-3xl p-8 shadow-lg bg-gradient-to-br from-[hsl(134,35%,45%)] to-[#135d55]">
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/10 pointer-events-none" />
        <h1 className="relative text-2xl sm:text-3xl font-black text-white">Paramètres IA</h1>
        <p className="relative text-white/70 text-sm mt-1">Configuration de l'algorithme d'affectation pondérée.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-[hsl(134,35%,45%)]" />
            <h2 className="text-lg font-semibold text-gray-700">Poids de l'algorithme</h2>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-sm font-bold ${total === 100 ? "text-emerald-600" : "text-amber-600"}`}>
              Total : {total}%
            </span>
            <button onClick={normalize}
              className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-[hsl(134,35%,45%)] transition">
              <RefreshCw className="w-3 h-3" /> Normaliser
            </button>
          </div>
        </div>
        {total !== 100 && (
          <div className="mx-6 mt-4 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700 font-semibold">
            ⚠ Le total doit être égal à 100%. Utilisez "Normaliser" pour ajuster automatiquement.
          </div>
        )}
        <div className="p-6 space-y-6">
          {weights.map((w) => (
            <div key={w.key} className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-gray-700">{w.label}</p>
                  <p className="text-xs text-slate-400">{w.description}</p>
                </div>
                <span className="text-lg font-black text-[hsl(134,35%,45%)] min-w-[3rem] text-right">{w.value}%</span>
              </div>
              <input type="range" min={0} max={100} step={1} value={w.value}
                onChange={(e) => updateWeight(w.key, Number(e.target.value))}
                className="w-full accent-[hsl(134,35%,45%)] h-2 rounded-full" />
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden -mt-1">
                <div className="h-full bg-[hsl(134,35%,45%)] rounded-full transition-all" style={{ width: `${w.value}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 px-6 py-5 border-b border-slate-100">
          <Settings2 className="w-5 h-5 text-slate-400" />
          <h2 className="text-lg font-semibold text-gray-700">Paramètres généraux</h2>
        </div>
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Modèle LLM</label>
            <select value={model} onChange={(e) => setModel(e.target.value)} className={inputCls}>
              <option value="gpt-oss-ctx24k:120B">gpt-oss-ctx24k:120B (défaut)</option>
              <option value="gpt-oss-ctx24k:70B">gpt-oss-ctx24k:70B (rapide)</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Affectations max / professeur</label>
            <input type="number" min={1} max={10} value={maxAffectations}
              onChange={(e) => setMax(Number(e.target.value))} className={inputCls} />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Score IA minimum (%) pour affectation</label>
            <div className="flex items-center gap-3">
              <input type="range" min={50} max={100} step={1} value={seuilScore}
                onChange={(e) => setSeuil(Number(e.target.value))}
                className="flex-1 accent-[hsl(134,35%,45%)]" />
              <span className="text-sm font-black text-[hsl(134,35%,45%)] min-w-[3rem] text-right">{seuilScore}%</span>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Affectation automatique</label>
            <div className="flex items-center gap-3 py-2">
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:bg-[hsl(134,35%,45%)] transition-colors" />
                <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-5" />
              </label>
              <span className="text-sm text-slate-600">Activer l'affectation auto à chaque nouvelle session</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        {saved
          ? <span className="flex items-center gap-1.5 text-sm font-semibold text-emerald-600"><CheckCircle2 className="w-4 h-4" /> Paramètres enregistrés !</span>
          : <span />
        }
        <button onClick={handleSave}
          className="px-6 py-2.5 text-sm font-bold text-white bg-[hsl(134,35%,45%)] rounded-xl hover:bg-[hsl(134,35%,35%)] transition">
          Enregistrer les paramètres
        </button>
      </div>
    </div>
  );
}
