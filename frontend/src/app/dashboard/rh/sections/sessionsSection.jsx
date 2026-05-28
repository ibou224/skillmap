"use client";

import { useState } from "react";
import { Calendar, Plus, Pencil, Trash2, Check, X } from "lucide-react";

const STATUT_STYLE = {
  PLANIFIEE: { bg: "bg-amber-50",   text: "text-amber-600",   label: "Planifiée" },
  EN_COURS:  { bg: "bg-blue-50",    text: "text-blue-600",    label: "En cours"  },
  TERMINEE:  { bg: "bg-emerald-50", text: "text-emerald-600", label: "Terminée"  },
};

const COURS_OPTIONS = [
  { code: "420-1A3", nom: "Programmation Web" },
  { code: "420-2B4", nom: "Base de données"   },
  { code: "420-3C5", nom: "IA Appliquée"      },
  { code: "420-1D6", nom: "Algorithmique"     },
];

const EMPTY_FORM = { code: "", cours: "", date: "", heure: "", salle: "", groupe: "", statut: "PLANIFIEE" };

const INITIAL = [
  { id:"1", code:"420-1A3", cours:"Programmation Web", date:"2026-09-08", heure:"08:30", salle:"B-204", groupe:"PI-01",  statut:"TERMINEE"  },
  { id:"2", code:"420-2B4", cours:"Base de données",   date:"2026-09-10", heure:"10:00", salle:"B-110", groupe:"PI-02",  statut:"TERMINEE"  },
  { id:"3", code:"420-3C5", cours:"IA Appliquée",      date:"2026-09-15", heure:"13:00", salle:"C-301", groupe:"IAI-01", statut:"EN_COURS"  },
  { id:"4", code:"420-1D6", cours:"Algorithmique",     date:"2026-09-22", heure:"09:00", salle:"B-205", groupe:"PI-01",  statut:"PLANIFIEE" },
];

export default function SessionsSection() {
  const [items, setItems]       = useState(INITIAL);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId]     = useState(null);
  const [form, setForm]         = useState(EMPTY_FORM);
  const [deleteId, setDeleteId] = useState(null);

  const set = (k, v) => {
    const updated = { ...form, [k]: v };
    if (k === "code") {
      const match = COURS_OPTIONS.find((c) => c.code === v);
      if (match) updated.cours = match.nom;
    }
    setForm(updated);
  };

  const isFormValid = form.code && form.date && form.heure && form.salle && form.groupe;

  const openCreate = () => { setForm(EMPTY_FORM); setEditId(null); setShowForm(true); };

  const openEdit = (s) => {
    setForm({ code: s.code, cours: s.cours, date: s.date, heure: s.heure, salle: s.salle, groupe: s.groupe, statut: s.statut });
    setEditId(s.id);
    setShowForm(true);
  };

  const save = () => {
    if (!isFormValid) return;
    if (editId) {
      setItems((prev) => prev.map((s) => s.id === editId ? { ...s, ...form } : s));
    } else {
      setItems((prev) => [...prev, { id: Date.now().toString(), ...form }]);
    }
    setShowForm(false);
    setEditId(null);
  };

  const remove = (id) => { setItems((prev) => prev.filter((s) => s.id !== id)); setDeleteId(null); };

  const inputCls = "w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[hsl(134,35%,45%)] transition";

  return (
    <div className="space-y-6">

      {/* Banner */}
      <div className="relative overflow-hidden rounded-3xl p-8 shadow-lg bg-gradient-to-br from-[hsl(134,35%,45%)] to-[#135d55]">
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/10 pointer-events-none" />
        <div className="relative flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">Sessions</h1>
            <p className="text-white/70 text-sm mt-1">Session active : Automne 2026</p>
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2 bg-white text-[hsl(134,35%,45%)] text-sm font-bold rounded-xl hover:bg-white/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nouvelle session
          </button>
        </div>
      </div>

      {/* Formulaire création / édition */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-[hsl(134,35%,45%)]/30 shadow-md p-6 space-y-4">
          <h2 className="text-sm font-black text-gray-700 uppercase tracking-widest">
            {editId ? "Modifier la session" : "Créer une session"}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Cours</label>
              <select value={form.code} onChange={(e) => set("code", e.target.value)} className={inputCls}>
                <option value="">Sélectionner…</option>
                {COURS_OPTIONS.map((c) => (
                  <option key={c.code} value={c.code}>{c.code} — {c.nom}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Date</label>
              <input type="date" value={form.date} onChange={(e) => set("date", e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Heure</label>
              <input type="time" value={form.heure} onChange={(e) => set("heure", e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Salle</label>
              <input type="text" placeholder="ex: B-204" value={form.salle} onChange={(e) => set("salle", e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Groupe</label>
              <input type="text" placeholder="ex: PI-01" value={form.groupe} onChange={(e) => set("groupe", e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Statut</label>
              <select value={form.statut} onChange={(e) => set("statut", e.target.value)} className={inputCls}>
                <option value="PLANIFIEE">Planifiée</option>
                <option value="EN_COURS">En cours</option>
                <option value="TERMINEE">Terminée</option>
              </select>
            </div>
          </div>
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={save}
              disabled={!isFormValid}
              className="flex items-center gap-2 px-4 py-2 bg-[hsl(134,35%,45%)] text-white text-sm font-bold rounded-xl hover:bg-[hsl(134,35%,38%)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <Check className="w-4 h-4" />
              {editId ? "Enregistrer" : "Créer"}
            </button>
            <button
              onClick={() => { setShowForm(false); setEditId(null); }}
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 text-sm font-bold rounded-xl hover:bg-slate-200 transition-colors"
            >
              <X className="w-4 h-4" />
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Confirm suppression */}
      {deleteId && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center justify-between">
          <p className="text-sm text-red-600 font-semibold">Confirmer la suppression de cette session ?</p>
          <div className="flex gap-2">
            <button onClick={() => remove(deleteId)} className="px-3 py-1.5 bg-red-500 text-white text-xs font-bold rounded-lg hover:bg-red-600 transition-colors">Supprimer</button>
            <button onClick={() => setDeleteId(null)} className="px-3 py-1.5 bg-white text-slate-600 text-xs font-bold rounded-lg hover:bg-slate-100 transition-colors">Annuler</button>
          </div>
        </div>
      )}

      {/* Tableau */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50/50 border-b border-slate-100">
            <tr>
              {["Code", "Cours", "Date", "Heure", "Salle", "Groupe", "Statut", "Actions"].map((h) => (
                <th key={h} className="px-6 py-4 text-left text-[11px] font-black uppercase tracking-widest text-slate-400">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {items.length === 0 ? (
              <tr><td colSpan={8} className="text-center py-16 text-slate-400 text-sm">Aucune session. Créez-en une !</td></tr>
            ) : items.map((s) => {
              const st = STATUT_STYLE[s.statut];
              return (
                <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4 text-xs font-mono text-slate-500">{s.code}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-800">{s.cours}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">{s.date}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">{s.heure}</td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-full">{s.salle}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-full">{s.groupe}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full ${st.bg} ${st.text}`}>{st.label}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(s)} title="Modifier" className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-50 text-blue-500 hover:bg-blue-100 transition-colors">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => setDeleteId(s.id)} title="Supprimer" className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

    </div>
  );
}