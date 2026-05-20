"use client";

import { useState } from "react";
import {
  BookOpen, Search, Plus, Trash2, Edit2,
  CheckCircle2, Clock, AlertCircle, Zap,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
type AffectationStatus = "affecté" | "en_attente" | "non_affecté";

interface Course {
  id: number;
  code: string;
  nom: string;
  programme: string;
  session: string;
  heures: number;
  status: AffectationStatus;
  professeur: string | null;
  scoreIA: number | null;
}

// ─── Mock data ────────────────────────────────────────────────────────────────
const mockCourses: Course[] = [
  { id: 1,  code: "INF-101", nom: "Intro à la programmation",     programme: "TI",   session: "Automne 2025", heures: 60, status: "affecté",     professeur: "Jean Dupont",    scoreIA: 94 },
  { id: 2,  code: "INF-301", nom: "Architecture des systèmes",    programme: "TI",   session: "Automne 2025", heures: 45, status: "affecté",     professeur: "Léa Bernard",    scoreIA: 88 },
  { id: 3,  code: "MAT-201", nom: "Algèbre linéaire",             programme: "SC",   session: "Automne 2025", heures: 60, status: "en_attente",  professeur: null,             scoreIA: null },
  { id: 4,  code: "RES-401", nom: "Réseaux avancés",              programme: "TI",   session: "Automne 2025", heures: 45, status: "non_affecté", professeur: null,             scoreIA: null },
  { id: 5,  code: "BDD-201", nom: "Bases de données",             programme: "TI",   session: "Automne 2025", heures: 60, status: "affecté",     professeur: "Pierre Gagnon",  scoreIA: 76 },
  { id: 6,  code: "WEB-301", nom: "Développement web avancé",     programme: "TI",   session: "Hiver 2026",   heures: 60, status: "non_affecté", professeur: null,             scoreIA: null },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const statusMeta: Record<AffectationStatus, { label: string; color: string; icon: React.ReactNode }> = {
  affecté:     { label: "Affecté",     color: "bg-emerald-100 text-emerald-700", icon: <CheckCircle2 className="w-3 h-3" /> },
  en_attente:  { label: "En attente",  color: "bg-amber-100 text-amber-700",     icon: <Clock className="w-3 h-3" />       },
  non_affecté: { label: "Non affecté", color: "bg-red-100 text-red-600",         icon: <AlertCircle className="w-3 h-3" /> },
};

const inputCls =
  "w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[hsl(134,35%,45%)] transition bg-white";

const scoreColor = (s: number) =>
  s >= 90 ? "text-emerald-600" : s >= 75 ? "text-amber-600" : "text-red-500";

// ─── Composant ────────────────────────────────────────────────────────────────
export default function CoursesSection() {
  const [courses, setCourses]             = useState<Course[]>(mockCourses);
  const [search, setSearch]               = useState("");
  const [filterStatus, setFilterStatus]   = useState<AffectationStatus | "tous">("tous");
  const [filterSession, setFilterSession] = useState("tous");
  const [showModal, setShowModal]         = useState(false);
  const [editCourse, setEditCourse]       = useState<Course | null>(null);

  const [form, setForm] = useState({
    code: "", nom: "", programme: "", session: "Automne 2025", heures: "60",
  });

  const sessions = ["tous", ...Array.from(new Set(courses.map((c) => c.session)))];

  const filtered = courses.filter((c) => {
    const q = search.toLowerCase();
    const matchSearch  = `${c.code} ${c.nom} ${c.programme}`.toLowerCase().includes(q);
    const matchStatus  = filterStatus === "tous" || c.status === filterStatus;
    const matchSession = filterSession === "tous" || c.session === filterSession;
    return matchSearch && matchStatus && matchSession;
  });

  const openAdd = () => {
    setEditCourse(null);
    setForm({ code: "", nom: "", programme: "", session: "Automne 2025", heures: "60" });
    setShowModal(true);
  };

  const openEdit = (c: Course) => {
    setEditCourse(c);
    setForm({ code: c.code, nom: c.nom, programme: c.programme, session: c.session, heures: String(c.heures) });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.code || !form.nom) return;
    if (editCourse) {
      setCourses((prev) => prev.map((c) => c.id === editCourse.id
        ? { ...c, ...form, heures: Number(form.heures) } : c));
    } else {
      setCourses((prev) => [...prev, {
        id: Date.now(), ...form, heures: Number(form.heures),
        status: "non_affecté", professeur: null, scoreIA: null,
      }]);
    }
    setShowModal(false);
  };

  const deleteCourse = (id: number) =>
    setCourses((prev) => prev.filter((c) => c.id !== id));

  const affecterIA = (id: number) =>
    setCourses((prev) => prev.map((c) => c.id === id
      ? { ...c, status: "affecté", professeur: "IA — En cours…", scoreIA: Math.floor(70 + Math.random() * 28) }
      : c));

  return (
    <div className="space-y-6">

      {/* ── Banner ── */}
      <div className="relative overflow-hidden rounded-3xl p-8 shadow-lg bg-gradient-to-br from-[hsl(134,35%,45%)] to-[#135d55]">
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/10 pointer-events-none" />
        <h1 className="relative text-2xl sm:text-3xl font-black text-white">Cours</h1>
        <p className="relative text-white/70 text-sm mt-1">Gestion des cours et affectations automatiques par l'IA.</p>
      </div>

      {/* ── Toolbar ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            placeholder="Rechercher un cours…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[hsl(134,35%,45%)] transition"
          />
        </div>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as AffectationStatus | "tous")}
          className="px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[hsl(134,35%,45%)] transition bg-white">
          <option value="tous">Tous les statuts</option>
          <option value="affecté">Affecté</option>
          <option value="en_attente">En attente</option>
          <option value="non_affecté">Non affecté</option>
        </select>
        <select value={filterSession} onChange={(e) => setFilterSession(e.target.value)}
          className="px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[hsl(134,35%,45%)] transition bg-white">
          {sessions.map((s) => <option key={s} value={s}>{s === "tous" ? "Toutes sessions" : s}</option>)}
        </select>
        <button onClick={openAdd}
          className="flex items-center gap-1.5 px-4 py-2 text-sm font-bold text-white bg-[hsl(134,35%,45%)] rounded-xl hover:bg-[hsl(134,35%,35%)] transition">
          <Plus className="w-4 h-4" /> Ajouter
        </button>
      </div>

      {/* ── Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filtered.map((c) => {
          const sm = statusMeta[c.status];
          return (
            <div key={c.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-[hsl(134,35%,45%)] bg-emerald-50 px-2 py-0.5 rounded-lg">{c.code}</span>
                    <span className="text-xs text-slate-400">{c.programme} · {c.session}</span>
                  </div>
                  <p className="font-bold text-gray-700 mt-1">{c.nom}</p>
                  <p className="text-xs text-slate-400">{c.heures}h</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(c)} className="text-slate-300 hover:text-[hsl(134,35%,45%)] transition"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => deleteCourse(c.id)} className="text-slate-300 hover:text-red-500 transition"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-lg ${sm.color}`}>
                  {sm.icon} {sm.label}
                </span>
                {c.scoreIA !== null && (
                  <span className={`text-xs font-black ${scoreColor(c.scoreIA)}`}>Score IA : {c.scoreIA}%</span>
                )}
              </div>

              {c.professeur && (
                <p className="text-xs text-slate-500 flex items-center gap-1">
                  <BookOpen className="w-3 h-3" /> {c.professeur}
                </p>
              )}

              {c.status !== "affecté" && (
                <button onClick={() => affecterIA(c.id)}
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs font-bold text-[hsl(134,35%,45%)] border border-[hsl(134,35%,45%)] rounded-xl hover:bg-emerald-50 transition">
                  <Zap className="w-3.5 h-3.5" /> Affecter via IA
                </button>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="sm:col-span-2 py-16 text-center text-slate-400 text-sm bg-white rounded-2xl border border-slate-100">
            Aucun cours trouvé.
          </div>
        )}
      </div>

      {/* ── Modal ── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
              <h2 className="text-lg font-semibold text-gray-700">{editCourse ? "Modifier le cours" : "Nouveau cours"}</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Code</label>
                  <input value={form.code} onChange={(e) => setForm((p) => ({ ...p, code: e.target.value }))} className={inputCls} placeholder="INF-101" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Programme</label>
                  <input value={form.programme} onChange={(e) => setForm((p) => ({ ...p, programme: e.target.value }))} className={inputCls} placeholder="TI" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Nom du cours</label>
                <input value={form.nom} onChange={(e) => setForm((p) => ({ ...p, nom: e.target.value }))} className={inputCls} placeholder="Introduction à la programmation" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Session</label>
                  <select value={form.session} onChange={(e) => setForm((p) => ({ ...p, session: e.target.value }))} className={inputCls}>
                    <option>Automne 2025</option>
                    <option>Hiver 2026</option>
                    <option>Été 2026</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Heures</label>
                  <input type="number" value={form.heures} onChange={(e) => setForm((p) => ({ ...p, heures: e.target.value }))} className={inputCls} placeholder="60" />
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/40 flex justify-end gap-3">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-semibold text-slate-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition">Annuler</button>
              <button onClick={handleSave} className="px-4 py-2 text-sm font-bold text-white bg-[hsl(134,35%,45%)] rounded-xl hover:bg-[hsl(134,35%,35%)] transition">
                {editCourse ? "Enregistrer" : "Créer"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}