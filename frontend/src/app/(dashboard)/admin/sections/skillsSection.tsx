"use client";

import { useState } from "react";
import { Zap, Plus, Trash2, Edit2, Search } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
type SkillCategory = "technique" | "pédagogie" | "langue" | "autre";

interface Skill {
  id: number;
  nom: string;
  categorie: SkillCategory;
  nbProfs: number;
  nbCours: number;
}

// ─── Mock data ────────────────────────────────────────────────────────────────
const mockSkills: Skill[] = [
  { id: 1,  nom: "Python",          categorie: "technique",  nbProfs: 12, nbCours: 8  },
  { id: 2,  nom: "React",           categorie: "technique",  nbProfs: 8,  nbCours: 5  },
  { id: 3,  nom: "TypeScript",      categorie: "technique",  nbProfs: 6,  nbCours: 4  },
  { id: 4,  nom: "SQL / PostgreSQL",categorie: "technique",  nbProfs: 15, nbCours: 6  },
  { id: 5,  nom: "Docker",          categorie: "technique",  nbProfs: 4,  nbCours: 2  },
  { id: 6,  nom: "Pédagogie active",categorie: "pédagogie",  nbProfs: 20, nbCours: 30 },
  { id: 7,  nom: "Évaluation",      categorie: "pédagogie",  nbProfs: 18, nbCours: 28 },
  { id: 8,  nom: "Français",        categorie: "langue",     nbProfs: 48, nbCours: 40 },
  { id: 9,  nom: "Anglais",         categorie: "langue",     nbProfs: 30, nbCours: 10 },
  { id: 10, nom: "Machine Learning",categorie: "technique",  nbProfs: 5,  nbCours: 3  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const catMeta: Record<SkillCategory, { label: string; color: string }> = {
  technique:  { label: "Technique",  color: "bg-blue-100 text-blue-700"       },
  pédagogie:  { label: "Pédagogie",  color: "bg-violet-100 text-violet-700"   },
  langue:     { label: "Langue",     color: "bg-amber-100 text-amber-700"     },
  autre:      { label: "Autre",      color: "bg-slate-100 text-slate-600"     },
};

const inputCls =
  "w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[hsl(134,35%,45%)] transition bg-white";

// ─── Composant ────────────────────────────────────────────────────────────────
export default function SkillsSection() {
  const [skills, setSkills]             = useState<Skill[]>(mockSkills);
  const [search, setSearch]             = useState("");
  const [filterCat, setFilterCat]       = useState<SkillCategory | "tous">("tous");
  const [showModal, setShowModal]       = useState(false);
  const [editSkill, setEditSkill]       = useState<Skill | null>(null);
  const [form, setForm]                 = useState({ nom: "", categorie: "technique" as SkillCategory });

  const filtered = skills.filter((s) => {
    const matchSearch = s.nom.toLowerCase().includes(search.toLowerCase());
    const matchCat    = filterCat === "tous" || s.categorie === filterCat;
    return matchSearch && matchCat;
  });

  const openAdd = () => { setEditSkill(null); setForm({ nom: "", categorie: "technique" }); setShowModal(true); };
  const openEdit = (s: Skill) => { setEditSkill(s); setForm({ nom: s.nom, categorie: s.categorie }); setShowModal(true); };

  const handleSave = () => {
    if (!form.nom) return;
    if (editSkill) {
      setSkills((prev) => prev.map((s) => s.id === editSkill.id ? { ...s, ...form } : s));
    } else {
      setSkills((prev) => [...prev, { id: Date.now(), ...form, nbProfs: 0, nbCours: 0 }]);
    }
    setShowModal(false);
  };

  const deleteSkill = (id: number) => setSkills((prev) => prev.filter((s) => s.id !== id));

  // Stats par catégorie
  const catCounts = (["technique","pédagogie","langue","autre"] as SkillCategory[]).map((c) => ({
    cat: c, count: skills.filter((s) => s.categorie === c).length,
  }));

  return (
    <div className="space-y-6">

      {/* ── Banner ── */}
      <div className="relative overflow-hidden rounded-3xl p-8 shadow-lg bg-gradient-to-br from-[hsl(134,35%,45%)] to-[#135d55]">
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/10 pointer-events-none" />
        <h1 className="relative text-2xl sm:text-3xl font-black text-white">Compétences</h1>
        <p className="relative text-white/70 text-sm mt-1">Référentiel de compétences utilisé par l'algorithme d'affectation IA.</p>
      </div>

      {/* ── Stat pills ── */}
      <div className="flex flex-wrap gap-3">
        {catCounts.map(({ cat, count }) => (
          <div key={cat} className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold ${catMeta[cat].color}`}>
            <Zap className="w-3 h-3" /> {catMeta[cat].label} — {count}
          </div>
        ))}
      </div>

      {/* ── Toolbar ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input placeholder="Rechercher une compétence…" value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[hsl(134,35%,45%)] transition" />
        </div>
        <select value={filterCat} onChange={(e) => setFilterCat(e.target.value as SkillCategory | "tous")}
          className="px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[hsl(134,35%,45%)] transition bg-white">
          <option value="tous">Toutes catégories</option>
          <option value="technique">Technique</option>
          <option value="pédagogie">Pédagogie</option>
          <option value="langue">Langue</option>
          <option value="autre">Autre</option>
        </select>
        <button onClick={openAdd}
          className="flex items-center gap-1.5 px-4 py-2 text-sm font-bold text-white bg-[hsl(134,35%,45%)] rounded-xl hover:bg-[hsl(134,35%,35%)] transition">
          <Plus className="w-4 h-4" /> Ajouter
        </button>
      </div>

      {/* ── Table ── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60">
                <th className="text-left px-5 py-3 text-xs font-bold text-slate-400 uppercase tracking-wide">Compétence</th>
                <th className="text-left px-5 py-3 text-xs font-bold text-slate-400 uppercase tracking-wide">Catégorie</th>
                <th className="text-left px-5 py-3 text-xs font-bold text-slate-400 uppercase tracking-wide">Professeurs</th>
                <th className="text-left px-5 py-3 text-xs font-bold text-slate-400 uppercase tracking-wide">Cours liés</th>
                <th className="text-left px-5 py-3 text-xs font-bold text-slate-400 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((s) => {
                const cm = catMeta[s.categorie];
                const pct = Math.min(100, Math.round((s.nbProfs / 48) * 100));
                return (
                  <tr key={s.id} className="hover:bg-slate-50/40 transition">
                    <td className="px-5 py-3 font-semibold text-gray-700">{s.nom}</td>
                    <td className="px-5 py-3">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-lg ${cm.color}`}>{cm.label}</span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-[hsl(134,35%,45%)] rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs text-slate-500">{s.nbProfs}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-slate-500">{s.nbCours}</td>
                    <td className="px-5 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(s)} className="text-slate-400 hover:text-[hsl(134,35%,45%)] transition"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => deleteSkill(s.id)} className="text-slate-400 hover:text-red-500 transition"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="px-5 py-10 text-center text-slate-400 text-sm">Aucune compétence trouvée.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/40 text-xs text-slate-400">
          {filtered.length} compétence{filtered.length !== 1 ? "s" : ""}
        </div>
      </div>

      {/* ── Modal ── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
              <h2 className="text-lg font-semibold text-gray-700">{editSkill ? "Modifier" : "Nouvelle compétence"}</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Nom</label>
                <input value={form.nom} onChange={(e) => setForm((p) => ({ ...p, nom: e.target.value }))} className={inputCls} placeholder="Python" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Catégorie</label>
                <select value={form.categorie} onChange={(e) => setForm((p) => ({ ...p, categorie: e.target.value as SkillCategory }))} className={inputCls}>
                  <option value="technique">Technique</option>
                  <option value="pédagogie">Pédagogie</option>
                  <option value="langue">Langue</option>
                  <option value="autre">Autre</option>
                </select>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/40 flex justify-end gap-3">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-semibold text-slate-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition">Annuler</button>
              <button onClick={handleSave} className="px-4 py-2 text-sm font-bold text-white bg-[hsl(134,35%,45%)] rounded-xl hover:bg-[hsl(134,35%,35%)] transition">
                {editSkill ? "Enregistrer" : "Créer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}