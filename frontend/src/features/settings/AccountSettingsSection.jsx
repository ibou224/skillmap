"use client";

import { Settings, ShieldCheck, UserCircle2 } from "lucide-react";
import { ProfileCard } from "@/components/settings/ProfileCard";
import { PasswordCard } from "@/components/settings/PasswordCard";

export default function AccountSettingsSection({ user = {} }) {
  return (
    <div className="max-w-6xl mx-auto space-y-10">

      {/* ── En-tête ── */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-[hsl(134,35%,45%)]/10 p-2 rounded-lg">
            <Settings className="w-5 h-5 text-[hsl(134,35%,45%)]" />
          </div>
          <span className="text-sm font-bold text-[hsl(134,35%,45%)] uppercase tracking-wider">
            Mon compte
          </span>
        </div>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">
          Paramètres <span className="text-[hsl(134,35%,45%)]">du compte</span>
        </h1>
        <p className="text-slate-500 mt-2 text-lg max-w-2xl">
          Gérez vos informations personnelles et votre sécurité en un seul endroit.
        </p>
      </div>

      {/* ── Grille 12 colonnes ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* Colonne gauche — Identité */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center gap-2 px-1 text-slate-400">
            <UserCircle2 size={16} />
            <span className="text-xs font-bold uppercase tracking-widest">Identité</span>
          </div>
          <ProfileCard user={user} />
        </div>

        {/* Colonne droite — Sécurité */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center gap-2 px-1 text-slate-400">
            <ShieldCheck size={16} />
            <span className="text-xs font-bold uppercase tracking-widest">Sécurité</span>
          </div>
          <PasswordCard />
        </div>

      </div>

      <footer className="pt-6 border-t border-slate-100 text-center">
        <p className="text-slate-400 text-sm">&copy; 2026 SkillMap — Gestion des compétences</p>
      </footer>
    </div>
  );
}
