"use client";

import { useState } from "react";
import { UserCircle, Mail, BadgeCheck, Save, Loader2 } from "lucide-react";
import { useSettings } from "@/hooks/useSettings";
import Feedback from "@/components/ui/Feedback";

/**
 * @module components/settings/ProfileCard
 * @description Carte d'édition des informations de profil (prénom, nom) du compte connecté.
 */

/** Classe CSS commune des champs de saisie. */
const fieldCls =
  "w-full pl-11 pr-4 py-3 bg-gray-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-[hsl(134,35%,45%)] focus:ring-0 transition-all outline-none text-gray-700 placeholder:text-gray-400";

/**
 * Carte d'édition du profil utilisateur.
 * @param {Object} props
 * @param {Object} [props.user={}] - Données du compte (prenom, nom, email...).
 * @returns {JSX.Element} La carte de profil.
 */
export function ProfileCard({ user = {} }) {
  const [profil, setProfil] = useState({ prenom: user.prenom ?? "", nom: user.nom ?? "" });
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: null, message: null });
  const { changeProfile } = useSettings();

  const initials = ((profil.prenom?.[0] ?? "") + (profil.nom?.[0] ?? "")).toUpperCase() || "?";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFeedback({ type: null, message: null });
    try {
      const result = await changeProfile({ nom: profil.nom, prenom: profil.prenom });
      if (result) setFeedback({ type: "success", message: "Profil mis à jour avec succès." });
    } catch (err) {
      setFeedback({ type: "error", message: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-gray-100 shadow-xl rounded-2xl overflow-hidden">

      {/* Bandeau + avatar */}
      <div className="relative h-28 bg-gradient-to-r from-[hsl(134,35%,45%)]/20 to-emerald-50">
        <div className="absolute -bottom-10 left-8">
          <div className="w-20 h-20 rounded-2xl bg-white p-1 shadow-lg">
            <div className="w-full h-full rounded-xl bg-gradient-to-br from-[hsl(134,35%,45%)] to-[#135d55] flex items-center justify-center">
              <span className="text-2xl font-black text-white">{initials}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-14 px-8 pb-8">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            Mon profil
            <BadgeCheck className="w-5 h-5 text-[hsl(134,35%,45%)]" />
          </h2>
          <p className="text-sm text-gray-500">Modifiez vos informations personnelles.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-600 ml-1">Prénom
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400 group-focus-within:text-[hsl(134,35%,45%)] transition-colors">
                  <UserCircle size={18} />
                </div>
                <input
                  type="text"
                  value={profil.prenom}
                  onChange={(e) => setProfil((p) => ({ ...p, prenom: e.target.value }))}
                  placeholder="Votre prénom"
                  className={fieldCls}
                  required
                />
              </div>
              </label>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-600 ml-1">Nom
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400 group-focus-within:text-[hsl(134,35%,45%)] transition-colors">
                  <UserCircle size={18} />
                </div>
                <input
                  type="text"
                  value={profil.nom}
                  onChange={(e) => setProfil((p) => ({ ...p, nom: e.target.value }))}
                  placeholder="Votre nom"
                  className={fieldCls}
                  required
                />
              </div>
              </label>
            </div>
          </div>

          {/* Email — affichage readonly */}
          <div className="p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-2 text-gray-400 mb-1">
              <Mail size={15} />
              <span className="text-xs font-bold uppercase tracking-wider">Adresse e-mail</span>
            </div>
            <p className="text-gray-700 font-medium pl-6">{user.email ?? "—"}</p>
            <p className="text-[11px] text-gray-400 pl-6 mt-0.5">
              L&apos;adresse e-mail ne peut pas être modifiée.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <Feedback {...feedback} />
            <button
              type="submit"
              disabled={loading}
              className="ml-auto flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-[hsl(134,35%,45%)] rounded-xl hover:bg-[hsl(134,35%,35%)] active:scale-95 transition-all disabled:opacity-50 shadow-sm"
            >
              {loading ? (
                <><Loader2 size={16} className="animate-spin" /> Enregistrement…</>
              ) : (
                <><Save size={16} /> Enregistrer</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
