"use client";

import { useState, useEffect, useCallback } from "react";
import {
  History, RefreshCw, AlertCircle, RotateCcw,
  FileText, Clock, CheckCircle2, ChevronDown, ChevronUp,
} from "lucide-react";

const SOURCE_STYLE = {
  "Extraction IA":       { bg: "bg-blue-50",   text: "text-blue-700",   dot: "bg-blue-400"   },
  "Modification manuelle": { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-400" },
};

function formatDate(iso) {
  return new Date(iso).toLocaleString("fr-CA", {
    day:    "numeric",
    month:  "long",
    year:   "numeric",
    hour:   "2-digit",
    minute: "2-digit",
  });
}

function VersionCard({ snapshot, onRestore, isRestoring }) {
  const [expanded, setExpanded] = useState(false);
  const style = SOURCE_STYLE[snapshot.label] ?? {
    bg: "bg-slate-50", text: "text-slate-600", dot: "bg-slate-400",
  };

  return (
    <div className="border border-slate-100 rounded-2xl overflow-hidden transition-all">
      {/* En-tête de la carte */}
      <div className="px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 hover:bg-slate-50/60 transition-colors">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-xl ${style.bg} flex items-center justify-center shrink-0`}>
            <FileText className={`w-4 h-4 ${style.text}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-gray-800">
                Version {snapshot.version}
              </span>
              <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${style.bg} ${style.text}`}>
                {snapshot.label}
              </span>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
              <Clock className="w-3 h-3" /> {formatDate(snapshot.createdAt)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={() => setExpanded((v) => !v)}
            className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition"
          >
            Aperçu {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
          <button
            onClick={() => onRestore(snapshot)}
            disabled={isRestoring}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-[hsl(134,35%,45%)] rounded-lg hover:bg-[hsl(134,35%,35%)] transition disabled:opacity-50"
          >
            {isRestoring ? (
              <RefreshCw className="w-3 h-3 animate-spin" />
            ) : (
              <RotateCcw className="w-3 h-3" />
            )}
            Revenir à cette version
          </button>
        </div>
      </div>

      {/* Aperçu du contenu */}
      {expanded && (
        <div className="px-5 pb-5 pt-1 border-t border-slate-100 bg-slate-50/40">
          <SnapshotPreview data={snapshot.data} />
        </div>
      )}
    </div>
  );
}

function SnapshotPreview({ data }) {
  if (!data) return <p className="text-xs text-slate-400">Aucune donnée.</p>;

  const sections = [
    {
      title: "Compétences",
      items: (data.competences ?? []).map((c) =>
        typeof c === "string" ? c : `${c.nom} (${c.niveau?.toLowerCase()})`
      ),
    },
    {
      title: "Expériences",
      items: (data.experiences ?? []).map((e) =>
        `${e.poste} — ${e.entreprise} (${e.debut}${e.fin ? ` → ${e.fin}` : " · en cours"})`
      ),
    },
    {
      title: "Formations",
      items: (data.formations ?? []).map((f) =>
        `${f.diplome} — ${f.etablissement} (${f.anneeObtention})`
      ),
    },
    {
      title: "Langues",
      items: data.langues ?? [],
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
      {sections.map(({ title, items }) => (
        <div key={title}>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">
            {title}
          </p>
          {items.length === 0 ? (
            <p className="text-xs text-slate-300 italic">Aucun</p>
          ) : (
            <ul className="space-y-1">
              {items.map((item, i) => (
                <li key={i} className="text-xs text-slate-600 flex items-start gap-1.5">
                  <span className="mt-1.5 w-1 h-1 rounded-full bg-slate-300 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
      {data.resume && (
        <div className="sm:col-span-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">
            Résumé
          </p>
          <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">{data.resume}</p>
        </div>
      )}
    </div>
  );
}

export default function HistoriqueCvSection() {
  const [snapshots, setSnapshots]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [restoringId, setRestoringId] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");

  const fetchSnapshots = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/professor/snapshots");
      if (!res.ok) throw new Error(`Erreur ${res.status}`);
      const { data } = await res.json();
      setSnapshots(data ?? []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchSnapshots(); }, [fetchSnapshots]);

  const handleRestore = async (snapshot) => {
    if (!confirm(`Revenir à la version ${snapshot.version} — "${snapshot.label}" du ${formatDate(snapshot.createdAt)} ?\n\nVotre version actuelle sera sauvegardée automatiquement.`)) return;

    setRestoringId(snapshot.id);
    setError(null);
    try {
      const res = await fetch(`/api/professor/snapshots/${snapshot.id}/restore`, {
        method: "POST",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message);
      setSuccessMsg(json.message);
      setTimeout(() => setSuccessMsg(""), 5000);
      fetchSnapshots();
    } catch (err) {
      setError(err.message);
    } finally {
      setRestoringId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Bannière */}
      <div className="relative overflow-hidden rounded-3xl p-8 shadow-lg bg-linear-to-br from-[hsl(134,35%,45%)] to-[#135d55]">
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/10 pointer-events-none" />
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <History className="w-5 h-5 text-white/70" />
              <h1 className="text-2xl sm:text-3xl font-black text-white">Historique de mon CV</h1>
            </div>
            <p className="text-white/70 text-sm">
              Chaque modification de votre CV est sauvegardée ici. Vous pouvez revenir à n&apos;importe quelle version à tout moment.
            </p>
          </div>
          <button
            onClick={fetchSnapshots}
            disabled={loading}
            className="self-start px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-white text-sm font-medium flex items-center gap-2 transition disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Actualiser
          </button>
        </div>
      </div>

      {/* Alertes */}
      {successMsg && (
        <div className="flex items-center gap-2 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-700 font-medium">
          <CheckCircle2 className="w-4 h-4 shrink-0" /> {successMsg}
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          <AlertCircle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}

      {/* Liste des versions */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-gray-800">Versions enregistrées</h2>
          <span className="text-xs text-slate-400">
            {snapshots.length} version{snapshots.length !== 1 ? "s" : ""}
          </span>
        </div>

        <div className="p-4 space-y-3">
          {loading ? (
            <div className="flex items-center justify-center py-12 gap-2 text-slate-400">
              <RefreshCw size={18} className="animate-spin" />
              <span className="text-sm">Chargement…</span>
            </div>
          ) : snapshots.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3 text-slate-400">
              <History className="w-10 h-10 text-slate-200" />
              <p className="text-sm text-center">
                Aucune version enregistrée pour l&apos;instant.<br />
                <span className="text-xs">Votre historique apparaîtra ici après votre première sauvegarde.</span>
              </p>
            </div>
          ) : (
            snapshots.map((snap) => (
              <VersionCard
                key={snap.id}
                snapshot={snap}
                onRestore={handleRestore}
                isRestoring={restoringId === snap.id}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}