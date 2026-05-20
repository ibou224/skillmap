"use client";

import { FileText, ClipboardList, TrendingUp, Upload } from "lucide-react";
import Link from "next/link";

// ─── Mock data (remplacer par fetch API) ──────────────────────────────────────
const mockUser = { prenom: "Jean", nom: "Dupont" };
const mockStats = {
  cvStatus: "VALIDATED" as "PENDING" | "EXTRACTED" | "VALIDATED",
  coursAssignes: 3,
  scoreMoyen: 87,
  sessionActive: "Automne 2026",
};
const mockCours = [
  { id: "1", code: "420-1A3", nom: "Programmation Web", programme: "PI", etape: 1, score: 92 },
  { id: "2", code: "420-2B4", nom: "Base de données",   programme: "PI", etape: 2, score: 85 },
  { id: "3", code: "420-3C5", nom: "IA Appliquée",      programme: "IAI", etape: 3, score: 84 },
];

const CV_STATUS = {
  PENDING:   { label: "En attente",  bg: "bg-amber-50",   text: "text-amber-600",  dot: "bg-amber-400"   },
  EXTRACTED: { label: "Extrait",     bg: "bg-blue-50",    text: "text-blue-600",   dot: "bg-blue-400"    },
  VALIDATED: { label: "Validé",      bg: "bg-emerald-50", text: "text-emerald-600",dot: "bg-emerald-400" },
};

const statCards = [
  {
    icon: FileText,
    label: "Statut CV",
    color: "text-blue-600",
    bg: "bg-blue-50",
    value: () => {
      const s = CV_STATUS[mockStats.cvStatus];
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${s.bg} ${s.text}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
          {s.label}
        </span>
      );
    },
  },
  {
    icon: ClipboardList,
    label: "Cours assignés",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    value: () => <span className="text-3xl font-black text-gray-900 tabular-nums">{mockStats.coursAssignes}</span>,
  },
  {
    icon: TrendingUp,
    label: "Score moyen",
    color: "text-violet-600",
    bg: "bg-violet-50",
    value: () => <span className="text-3xl font-black text-gray-900 tabular-nums">{mockStats.scoreMoyen}%</span>,
  },
];

// ─── Composant ────────────────────────────────────────────────────────────────
export default function HomeSection() {
  return (
    <div className="space-y-6">

      {/* ── Banner ── */}
      <div className="relative overflow-hidden rounded-3xl p-8 shadow-lg bg-gradient-to-br from-[hsl(134,35%,45%)] to-[#135d55]">
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/10 pointer-events-none" />
        <div className="absolute -bottom-10 -left-6 w-28 h-28 rounded-full bg-white/5 pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-white/60 text-sm font-medium">{mockStats.sessionActive}</p>
            <h1 className="text-2xl sm:text-3xl font-black text-white mt-0.5">
              Bonjour, {mockUser.prenom} 👋
            </h1>
            <p className="text-white/70 text-sm mt-1">Voici un aperçu de votre profil et de vos affectations.</p>
          </div>
          <Link
            href="/professeur/cv"
            className="inline-flex items-center gap-2 bg-white text-[hsl(134,35%,45%)] font-bold px-4 py-2.5 rounded-xl hover:bg-white/90 transition-colors text-sm shrink-0"
          >
            <Upload className="w-4 h-4" />
            Mettre à jour mon CV
          </Link>
        </div>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {statCards.map(({ icon: Icon, label, color, bg, value: Value }) => (
          <div key={label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${bg}`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide mb-1">{label}</p>
              <Value />
            </div>
          </div>
        ))}
      </div>

      {/* ── Cours assignés ── */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-gray-700">Mes cours affectés</h2>
          <Link href="/professeur/assignments" className="text-xs font-bold text-[hsl(134,35%,45%)] hover:underline">
            Voir tout →
          </Link>
        </div>
        <table className="w-full">
          <thead className="bg-slate-50/50 border-b border-slate-100">
            <tr>
              {["Code", "Cours", "Programme", "Étape", "Score"].map((h) => (
                <th key={h} className="px-6 py-4 text-left text-[11px] font-black uppercase tracking-widest text-slate-400">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {mockCours.map((c) => (
              <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="px-6 py-4 text-xs font-mono text-slate-500">{c.code}</td>
                <td className="px-6 py-4 text-sm font-semibold text-gray-800">{c.nom}</td>
                <td className="px-6 py-4">
                  <span className="px-2.5 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-full">{c.programme}</span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-500">{c.etape}</td>
                <td className="px-6 py-4">
                  <span className="text-sm font-black text-emerald-600">{c.score}%</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}