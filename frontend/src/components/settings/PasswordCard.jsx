"use client";

import { useState } from "react";
import { ShieldCheck, KeyRound, Lock, Eye, EyeOff, Save, Loader2 } from "lucide-react";
import { useSettings } from "@/hooks/useSettings";
import Feedback from "@/components/ui/Feedback";

const fieldCls =
  "w-full pl-11 pr-12 py-3 bg-gray-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-[hsl(134,35%,45%)] focus:ring-0 transition-all outline-none text-gray-700 placeholder:text-gray-400";

export function PasswordCard() {
  const [show, setShow] = useState({ current: false, next: false, confirm: false });
  const [data, setData] = useState({ password: "", newpassword: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: null, message: null });
  const { changePassword } = useSettings();

  const toggle = (key) => setShow((s) => ({ ...s, [key]: !s[key] }));
  const set = (key) => (e) => setData((d) => ({ ...d, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFeedback({ type: null, message: null });
    try {
      const result = await changePassword({ password: data.password, newpassword: data.newpassword, confirmPassword: data.confirmPassword });
      if (result) {
        setFeedback({ type: "success", message: "Mot de passe mis à jour avec succès." });
        setData({ password: "", newpassword: "", confirmPassword: "" });
      }
    } catch (err) {
      setFeedback({ type: "error", message: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-gray-100 shadow-xl rounded-2xl overflow-hidden">

      <div className="flex items-center gap-4 px-8 py-6 border-b border-gray-50">
        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-[hsl(134,35%,45%)]/10">
          <ShieldCheck size={26} className="text-[hsl(134,35%,45%)]" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-800">Sécurité du compte</h2>
          <p className="text-sm text-gray-500">Protégez votre accès avec un mot de passe robuste.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-5">

        {/* Mot de passe actuel */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-600 ml-1">Mot de passe actuel
            <div className="relative group mt-2">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400 group-focus-within:text-[hsl(134,35%,45%)] transition-colors">
                <KeyRound size={18} />
              </div>
              <input
                type={show.current ? "text" : "password"}
                value={data.password}
                name="current-password"
                autoComplete="off"
                onChange={set("password")}
                placeholder="Saisissez votre mot de passe actuel"
                className={fieldCls}
                required
              />
              <button
                type="button"
                onClick={() => toggle("current")}
                tabIndex={-1}
                className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {show.current ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </label>
        </div>

        <div className="h-px bg-gray-100" />

        {/* Nouveau mot de passe */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-600 ml-1">Nouveau mot de passe
            <div className="relative group mt-2">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400 group-focus-within:text-[hsl(134,35%,45%)] transition-colors">
                <Lock size={18} />
              </div>
              <input
                type={show.next ? "text" : "password"}
                value={data.newpassword}
                name="new-password"
                autoComplete="new-password"
                onChange={set("newpassword")}
                placeholder="Entrez votre nouveau mot de passe"
                className={fieldCls}
                required
              />
              <button
                type="button"
                onClick={() => toggle("next")}
                tabIndex={-1}
                className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {show.next ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </label>
        </div>

        {/* Confirmer le mot de passe */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-600 ml-1">Confirmer le mot de passe
            <div className="relative group mt-2">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400 group-focus-within:text-[hsl(134,35%,45%)] transition-colors">
                <Lock size={18} />
              </div>
              <input
                type={show.confirm ? "text" : "password"}
                value={data.confirmPassword}
                name="confirm-password"
                autoComplete="new-password"
                onChange={set("confirmPassword")}
                placeholder="Confirmez le nouveau mot de passe"
                className={fieldCls}
                required
              />
              <button
                type="button"
                onClick={() => toggle("confirm")}
                tabIndex={-1}
                className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {show.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </label>
        </div>

        <div className="pt-2 space-y-3">
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 text-sm font-bold text-white bg-[hsl(134,35%,45%)] rounded-xl hover:bg-[hsl(134,35%,35%)] active:scale-[0.99] transition-all disabled:opacity-50 shadow-sm"
          >
            {loading ? (
              <><Loader2 size={18} className="animate-spin" /> Modification en cours…</>
            ) : (
              <><Save size={18} /> Mettre à jour le mot de passe</>
            )}
          </button>
          <Feedback {...feedback} />
        </div>

      </form>
    </div>
  );
}
