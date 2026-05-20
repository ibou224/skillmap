/**
 * @module professeur/dashboard/DashboardPage
 * @description Page d'accueil du professeur – suivi du CV, informations extraites par l'IA,
 *              affectations effectuées par le RH, et statistiques personnelles.
 */

"use client";

import { useState } from "react";
import {StatCard} from "../components/StatCard";
import {
  LayoutDashboard,
  Calendar,
  Bell,
  FileText,
  Clock,
  CheckCircle,
  TrendingUp,
  UploadCloud,
  Eye,
  Edit3,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────

const STATUT_STYLE = {
  FINALISEE: { bg: "bg-emerald-50", text: "text-emerald-600", label: "Finalisée" },
  AJUSTEE:   { bg: "bg-blue-50",    text: "text-blue-600",    label: "Ajustée"   },
  PROPOSEE:  { bg: "bg-amber-50",   text: "text-amber-600",   label: "Proposée"  },
};

// ─── Mock data ────────────────────────────────────────────────────────────────

// Statut global du CV
const cvStatus = "validé"; // "non_soumis" | "extrait" | "validé"

const professeur = {
  nom: "Marie Dupont",
  role: "Professeure – Département d'Informatique",
  competences: 12,
  experiences: 5,
  formations: 3,
  affectationsEnCours: 3,
  affectationsFutures: 2,
};

const sessionActuelle = {
  label: "Automne 2026",
  periode: "Sept. – Déc. 2026",
  cours: [
    { code: "420-1A3", nom: "Programmation Web",   programme: "PI",  horaire: "Lun 8h-10h, Mer 13h-15h", statut: "FINALISEE", score: 92 },
    { code: "420-3C5", nom: "IA Appliquée",        programme: "IAI", horaire: "Mar 10h-12h, Jeu 14h-16h", statut: "AJUSTEE",   score: 84 },
    { code: "420-2B4", nom: "Base de données",     programme: "PI",  horaire: "Ven 8h-10h",               statut: "FINALISEE", score: 85 },
  ],
};

const notifications = [
  { id: 1, type: "info",   message: "Votre CV a été validé avec succès.", date: "Il y a 2 heures" },
  { id: 2, type: "success", message: "Nouvelle affectation reçue : IA Appliquée (Automne 2026).", date: "Hier" },
  { id: 3, type: "warning", message: "Pensez à mettre à jour vos disponibilités pour l'Hiver 2027.", date: "Il y a 3 jours" },
];

// ─── Composant ────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [expanded, setExpanded] = useState(false);

  // Choisir le message d'accueil selon le statut du CV
  const welcomeMessage = {
    non_soumis: "Bienvenue ! Commencez par soumettre votre CV.",
    extrait:    "Votre CV a été analysé. Veuillez vérifier et valider les informations extraites.",
    validé:     `Bonjour, ${professeur.nom}`,
  }[cvStatus];

  const statusBadge = {
    non_soumis: { bg: "bg-slate-100", text: "text-slate-600", label: "CV non soumis" },
    extrait:    { bg: "bg-amber-100", text: "text-amber-700", label: "En attente de validation" },
    validé:     { bg: "bg-emerald-100", text: "text-emerald-700", label: "CV validé" },
  }[cvStatus];

  return (
    <div className="space-y-6">
      {/* ── Bannière de bienvenue avec statut du CV ── */}
      <div className="relative overflow-hidden rounded-3xl p-8 shadow-lg bg-gradient-to-br from-[hsl(134,35%,45%)] to-[#135d55]">
        <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white/10 pointer-events-none" />
        <div className="absolute -bottom-12 -left-8 w-36 h-36 rounded-full bg-white/5 pointer-events-none" />
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">{welcomeMessage}</h1>
            <p className="text-white/70 text-sm mt-1">{professeur.role}</p>
          </div>
          <span className={`self-start px-4 py-2 rounded-full text-xs font-bold ${statusBadge.bg} ${statusBadge.text}`}>
            {statusBadge.label}
          </span>
        </div>
      </div>

      {/* ── Cartes statistiques (issues du CV) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={CheckCircle} label="Compétences" value={professeur.competences} color="emerald" />
        <StatCard icon={FileText}     label="Expériences" value={professeur.experiences} color="blue" />
        <StatCard icon={TrendingUp}   label="Formations"  value={professeur.formations}  color="purple" />
        <StatCard icon={Clock}        label="Affectations en cours" value={professeur.affectationsEnCours} color="amber" />
      </div>

      {/* ── Grille principale : affectations en cours + notifications ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne gauche : affectations (attribuées par le RH) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-gray-800">Mes affectations</h2>
              <p className="text-xs text-slate-400">
                Session {sessionActuelle.label} · {sessionActuelle.periode}
              </p>
            </div>
            <Link
              href="/historique"
              className="text-xs font-medium text-[hsl(134,35%,45%)] hover:underline flex items-center gap-1"
            >
              Historique <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-slate-50">
            {sessionActuelle.cours.map((cours) => {
              const s = STATUT_STYLE[cours.statut];
              return (
                <div key={cours.code} className="px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between hover:bg-slate-50/80 transition-colors gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-800">{cours.nom}</span>
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-blue-50 text-blue-600">
                        {cours.programme}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{cours.code} – {cours.horaire}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full ${s.bg} ${s.text}`}>
                      {s.label}
                    </span>
                    <span className="text-sm font-black text-emerald-600">{cours.score}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Colonne droite : notifications */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-base font-bold text-gray-800">Notifications</h2>
            <Bell className="w-4 h-4 text-slate-400" />
          </div>
          <div className="divide-y divide-slate-50">
            {notifications.slice(0, expanded ? notifications.length : 2).map((notif) => (
              <div key={notif.id} className="px-6 py-3 hover:bg-slate-50/80 transition-colors">
                <p className="text-sm text-gray-700">{notif.message}</p>
                <p className="text-xs text-slate-400 mt-1">{notif.date}</p>
              </div>
            ))}
            {notifications.length > 2 && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="w-full px-6 py-2 text-xs font-medium text-[hsl(134,35%,45%)] hover:bg-slate-50 text-left transition-colors"
              >
                {expanded ? "Voir moins" : `Voir les ${notifications.length - 2} autres`}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
