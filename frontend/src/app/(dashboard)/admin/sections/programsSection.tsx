"use client";

import { useState } from "react";
import { Layers, Plus, Trash2, Edit2, Search, BookOpen, Users } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Program {
  id: number;
  code: string;
  nom: string;
  departement: string;
  nbCours: number;
  nbProfs: number;
  actif: boolean;
}

// ─── Mock data ────────────────────────────────────────────────────────────────
const mockPrograms: Program[] = [
  { id: 1, code: "TI",    nom: "Techniques de l'informatique",      departement: "Informatique",  nbCours: 42, nbProfs: 18, actif: true  },
  { id: 2, code: "SC",    nom: "Sciences de la nature",             departement: "Sciences",      nbCours: 30, nbProfs: 12, actif: true  },
  { id: 3, code: "GES",   nom: "Gestion de commerces",              departement: "Commerce",      nbCours: 28, nbProfs: 10, actif: true  },
  { id: 4, code: "AEC-IA",nom: "AEC Intelligence Artificielle",     departement: "Informatique",  nbCours: 18, nbProfs: 6,  actif: true  },
  { id: 5, code: "ARCH",  nom: "Architecture et environnement bâti",departement: "Arts appliqués",nbCours: 22, nbProfs: 8,  actif: false },
];

const inputCls =
  "w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[hsl(134,35%,45%)] transition bg-white";

// ─── Composant ────────────────────────────────────────────────────────────────
export default function ProgramsSection() {
  const [programs, setPrograms] = useState<Program[]>(mockPrograms);
  const [search, setSearch]     = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editProg, setEditProg]   = useState<Program | null>(null);
  const [form, setForm] = useState({ code: "", nom: "", departement: "" });

  const filtered = programs.filter((p) =>
    `${p.code} ${p.nom} ${p.departement}`.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => { setEditProg(null); setForm({ code: "", nom: "", departement: "" }); setShowModal(true); };
  const openEdit = (p: Program) => { setEditProg(p); setForm({ code: p.code, nom: p.nom, departement: p.departement }); setShowModal(true); };

  const handleSave = () => {
    if (!form.code || !form.nom) return;
    if (editProg) {
      setPrograms((prev) => prev.map((p) => p.id === editProg.id ? { ...p, ...form } : p));
    } else {
      setPrograms((prev) => [...prev, { id: Date.now(), ...form, nbCours: 0, nbProfs: 0, actif: true }]);
    }
    setShowModal(false);
  };

  const toggleActif = (id: number) =>
    setPrograms((prev) => prev.map((p) => p.id === id ? { ...p, actif: !p.actif } : p));

  const deleteProg = (id: number) =>
    setPrograms((prev) => prev.filter((p) => p.id !== id));

  return (
    <div className="space-y-6">

      {/* ── Banner ── */}
      <div className="relative overflow-hidden rounded-3xl p-8 shadow-lg bg-gradient-to-br from-[hsl(134,35%,45%)] to-[#135d55]">
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/10 pointer-events-none" />
        <h1 className="relative text-2xl sm:text-3xl font-black text-white">Programmes</h1>
        <p className="relative text-white/70 text-sm mt-1">Gestion des programmes et départements académiques.</p>
      </div>

      {/* ── Toolbar ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input placeholder="Rechercher un programme…" value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[hsl(134,35%,45%)] transition" />
        </div>
        <button onClick={openAdd}
          className="flex items-center gap-1.5 px-4 py-2 text-sm font-bold text-white bg-[hsl(134,35%,45%)] rounded-xl hover:bg-[hsl(134,35%,35%)] transition">
          <Plus className="w-4 h-4" /> Ajouter
        </button>
      </div>

      {/* ── Cards grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filtered.map((p) => (
          <div key={p.id} className={`bg-white rounded-2xl border shadow-sm p-5 space-y-4 transition ${p.actif ? "border-slate-100" : "border-slate-100 opacity-60"}`}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-emerald-50 flex items-center justify-center">
                  <Layers className="w-5 h-5 text-[hsl(134,35%,45%)]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-[hsl(134,35%,45%)] bg-emerald-50 px-2 py-0.5 rounded-lg">{p.code}</span>
                    {!p.actif && <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-lg">Archivé</span>}
                  </div>
                  <p className="font-bold text-gray-700 mt-0.5 text-sm">{p.nom}</p>
                  <p className="text-xs text-slate-400">{p.departement}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => openEdit(p)} className="text-slate-300 hover:text-[hsl(134,35%,45%)] transition"><Edit2 className="w-4 h-4" /></button>
                <button onClick={() => deleteProg(p.id)} className="text-slate-300 hover:text-red-500 transition"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>

            <div className="flex gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" /> {p.nbCours} cours</span>
              <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {p.nbProfs} professeurs</span>
            </div>

            <button onClick={() => toggleActif(p.id)}
              className={`w-full py-1.5 text-xs font-bold rounded-xl border transition ${
                p.actif
                  ? "border-slate-200 text-slate-500 hover:bg-slate-50"
                  : "border-[hsl(134,35%,45%)] text-[hsl(134,35%,45%)] hover:bg-emerald-50"
              }`}>
              {p.actif ? "Archiver le programme" : "Réactiver le programme"}
            </button>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="sm:col-span-2 py-16 text-center text-slate-400 text-sm bg-white rounded-2xl border border-slate-100">Aucun programme trouvé.</div>
        )}
      </div>

      {/* ── Modal ── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
              <h2 className="text-lg font-semibold text-gray-700">{editProg ? "Modifier le programme" : "Nouveau programme"}</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Code</label>
                <input value={form.code} onChange={(e) => setForm((p) => ({ ...p, code: e.target.value }))} className={inputCls} placeholder="TI" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Nom complet</label>
                <input value={form.nom} onChange={(e) => setForm((p) => ({ ...p, nom: e.target.value }))} className={inputCls} placeholder="Techniques de l'informatique" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Département</label>
                <input value={form.departement} onChange={(e) => setForm((p) => ({ ...p, departement: e.target.value }))} className={inputCls} placeholder="Informatique" />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/40 flex justify-end gap-3">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-semibold text-slate-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition">Annuler</button>
              <button onClick={handleSave} className="px-4 py-2 text-sm font-bold text-white bg-[hsl(134,35%,45%)] rounded-xl hover:bg-[hsl(134,35%,35%)] transition">
                {editProg ? "Enregistrer" : "Créer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}