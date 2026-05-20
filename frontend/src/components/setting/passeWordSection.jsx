/**
 * @module components/setting/passeWordSection
 * @description Section de changement du mot de passe utilisateur.
 */

"use client";
import React, { useState } from "react";
import {
  Save,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  KeyRound,
  Loader2,
} from "lucide-react";
import { Button } from "../ui/Button";
import { useSettings } from "@/hooks/useSettings";
import { useUserInfo } from "@/hooks/useUserInfo";

/**
 * Affiche le formulaire de mise à jour du mot de passe.
 *
 * @returns {JSX.Element} Section de sécurité du compte.
 */
export function PasseWordSection() {
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const { user } = useUserInfo();
  const { changePassword, error, success, loading, lastUpdated } =
    useSettings();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await changePassword(password, newPassword, confirmPassword);
    if (result) {
      setPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  const showMessage = () => {
    if (error) {
      return <p className="text-center text-xs text-red-500 mt-4">{error}</p>;
    }
    if (success) {
      return (
        <p className="text-center text-xs text-green-500 mt-4">
          Mot de passe mis à jour avec succès
        </p>
      );
    }
  };

  return (
    <div className="max-w-2xl mx-auto overflow-hidden bg-warm-white border border-gray-100 shadow-xl rounded-2xl">
      <div className="px-8 py-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-cite-green/10 text-cite-green">
            <ShieldCheck size={28} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              Sécurité du compte
            </h2>
            <p className="text-sm text-gray-500">
              Protégez votre accès avec un mot de passe robuste
            </p>
          </div>
        </div>
      </div>

      <form className="p-8 space-y-6" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <label
            htmlFor="password"
            className="text-sm font-semibold text-gray-600 ml-1"
          >
            Mot de passe actuel
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400 group-focus-within:text-cite-green transition-colors">
              <KeyRound size={20} />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Saisissez votre mot de passe actuel"
              name="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-12 pr-12 py-3.5 bg-gray-50 border-transparent border-2 rounded-xl focus:bg-white focus:border-cite-green focus:ring-0 transition-all outline-none text-gray-700 placeholder:text-gray-400"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="space-y-2">
            <label
              htmlFor="new-password"
              className="text-sm font-semibold text-gray-600 ml-1"
            >
              Nouveau mot de passe
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400 group-focus-within:text-cite-green transition-colors">
                <Lock size={20} />
              </div>
              <input
                type={showNewPassword ? "text" : "password"}
                placeholder="Entrez votre nouveau mot de passe"
                name="new-password"
                id="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-transparent border-2 rounded-xl focus:bg-white focus:border-cite-green transition-all outline-none"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-gray-600"
              >
                {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="confirm-password"
              className="text-sm font-semibold text-gray-600 ml-1"
            >
              Confirmer le nouveau mot de passe
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400 group-focus-within:text-cite-green transition-colors">
                <Lock size={20} />
              </div>
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirmez le mot de passe"
                name="confirm-password"
                id="confirm-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-transparent border-2 rounded-xl focus:bg-white focus:border-cite-green transition-all outline-none"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
        </div>

        <div className="pt-4">
          <Button
            variant="citeGreen"
            disabled={loading}
            className="w-full py-6 rounded-xl text-sm font-bold flex items-center justify-center gap-2"
          >
            {loading
              ? "Modification en cours..."
              : "Mettre à jour le mot de passe"}
            {loading ? (
              <Loader2 className="animate-spin" size={22} />
            ) : (
              <Save size={22} />
            )}
          </Button>
          {showMessage()}
          {(lastUpdated || user?.updatedAt) && (
            <p className="text-center text-xs text-gray-400 mt-4">
              Dernière modification :{" "}
              {new Date(lastUpdated || user.updatedAt).toLocaleDateString(
                "fr-FR",
                {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                },
              )}
            </p>
          )}
        </div>
      </form>
    </div>
  );
}
