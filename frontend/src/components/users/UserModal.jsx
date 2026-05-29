"use client";

import { useState } from "react";
import { useManagementUser } from "@/hooks/useManagementUser";

const inputCls = "w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[hsl(134,35%,45%)] transition bg-white";

const disabledClasses =
  "disabled:bg-gray-50 disabled:text-gray-500 disabled:border-gray-100 disabled:cursor-not-allowed shadow-inner";

const ROLE_OPTIONS = [
  { value: "professeur", label: "Professeur" },
  { value: "rh", label: "RH" },
  { value: "admin", label: "Admin" },
];

const STATUS_OPTIONS = [
  { value: "actif", label: "Actif" },
  { value: "inactif", label: "Inactif" },
];

const DEFAULT_FORM = {
  prenom: "",
  nom: "",
  email: "",
  role: "professeur",
  status: "actif",
};

export function UserModal({ isOpen, onClose, userToEdit = null, onSuccess }) {
  const [form, setForm] = useState(
    userToEdit
      ? {
          prenom: userToEdit.prenom ?? "",
          nom: userToEdit.nom ?? "",
          email: userToEdit.email ?? "",
          role: userToEdit.role?.toLowerCase() ?? "professeur",
          status: userToEdit.isActive ? "actif" : "inactif",
        }
      : DEFAULT_FORM
  );
  const [errors, setErrors] = useState({});
  const [credentials, setCredentials] = useState(null);
  const [copied, setCopied] = useState(false);

  const { createUser, updateUser, error } = useManagementUser();

  /**
   * Copier le mot de passe dans le presse-papier
   */
  const handleCopy = () => {
    if (credentials?.password) {
      navigator.clipboard.writeText(credentials.password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Remet le bouton à zéro après 2s
    }
  };

  /**
   * Gestion de la soumission
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    if (userToEdit) {
      const updateResult = await updateUser(userToEdit.id, { estActif: form.status === "actif", role: form.role.toUpperCase() });

      if (!updateResult) {
        setErrors({ global: error || "Erreur lors de la mise à jour." });
      } else {
        if (onSuccess) onSuccess({ message: updateResult.message });
        onClose(); // On ferme directement en mode édition
      }
    } else {
      const result = await createUser(form.nom.trim(), form.prenom.trim(), form.role);

      if (result?.success && result.email) {
        setCredentials({
          email: result.email,
          password: result.generatedPassword,
        });
      } else {
        setErrors({ global: result?.message || "Erreur lors de la création." });
      }
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      if (credentials && onSuccess) onSuccess(); 
      onClose();
    }
  };

  if (!isOpen) return null;

  if (credentials) {
    return (
      <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={handleBackdropClick}>
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden p-8 space-y-6 text-center" onClick={(e) => e.stopPropagation()}>
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <div>
            <h2 className="text-xl font-bold text-gray-800">Utilisateur créé !</h2>
            <p className="text-sm text-slate-500 mt-1">Veuillez copier ces accès avant de fermer cette fenêtre.</p>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl text-left space-y-4 border border-slate-100">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Email généré</label>
              <div className="font-mono text-sm font-medium text-slate-700 bg-white px-3 py-2 border border-slate-200 rounded-lg select-all">
                {credentials.email}
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Mot de passe provisoire</label>
              <div className="flex items-center gap-2">
                <div className="flex-1 font-mono text-sm font-medium text-slate-700 bg-white px-3 py-2 border border-slate-200 rounded-lg select-all">
                  {credentials.password}
                </div>
                <button 
                  onClick={handleCopy}
                  className="p-2 text-slate-500 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition focus:outline-none focus:ring-2 focus:ring-[hsl(134,35%,45%)]"
                  title="Copier le mot de passe"
                >
                  {copied ? (
                    <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                  )}
                </button>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              if (onSuccess) onSuccess(); // On prévient le parent de rafraichir la liste
              onClose(); // On ferme le modal
            }}
            className="w-full py-2.5 text-sm font-bold text-white bg-[hsl(134,35%,45%)] rounded-xl hover:bg-[hsl(134,35%,35%)] transition"
          >
            Terminer et fermer
          </button>
        </div>
      </div>
    );
  }

  // ─── ÉCRAN DE FORMULAIRE NORMAL ───────────────────────────────────────────
  const isEditMode = userToEdit !== null;
  const isDisabled = !form.prenom.trim() || !form.nom.trim();

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
          <h2 id="modal-title" className="text-lg font-semibold text-gray-800">
            {isEditMode ? "Modifier l'utilisateur" : "Nouvel utilisateur"}
          </h2>
          <button
            onClick={onClose}
            aria-label="Fermer le modal"
            className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg p-1.5 transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body - Formulaire */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          
          {errors.global && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100">
              {errors.global}
            </div>
          )}

          {/* Prénom + Nom */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label htmlFor="prenom" className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                Prénom <span className="text-red-500">*</span>
              </label>
              <input
                id="prenom"
                value={form.prenom}
                onChange={(e) => setForm({ ...form, prenom: e.target.value })}
                className={`${inputCls} ${isEditMode ? disabledClasses : ""}`}
                placeholder="Jean"
                autoComplete="given-name"
                disabled={isEditMode}
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="nom" className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                Nom <span className="text-red-500">*</span>
              </label>
              <input
                id="nom"
                value={form.nom}
                onChange={(e) => setForm({ ...form, nom: e.target.value })}
                className={`${inputCls} ${isEditMode ? disabledClasses : ""}`}
                placeholder="Dupont"
                autoComplete="family-name"
                disabled={isEditMode} />
            </div>
          </div>

          {/* Email - Affiché uniquement en mode édition */}
          {isEditMode && (
            <div className="space-y-1">
              <label htmlFor="email" className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={form.email}
                className={`${inputCls} ${disabledClasses}`}
                disabled={true} 
              />
            </div>
          )}

          {/* Rôle */}
          <div className="space-y-1">
            <label htmlFor="role" className="text-xs font-bold text-slate-500 uppercase tracking-wide">
              Rôle <span className="text-red-500">*</span>
            </label>
            <select
              id="role"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className={inputCls}
            >
              {ROLE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Statut */}
          <div className="space-y-1">
            <label htmlFor="status" className="text-xs font-bold text-slate-500 uppercase tracking-wide">
              Statut
            </label>
            <select
              id="status"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className={inputCls}
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-slate-400">Un utilisateur inactif ne peut pas se connecter</p>
          </div>
        </div>

        {/* Footer - Actions */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/60 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-slate-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition focus:outline-none focus:ring-2 focus:ring-gray-300"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isDisabled}
            className="px-4 py-2 text-sm font-bold text-white bg-[hsl(134,35%,45%)] rounded-xl hover:bg-[hsl(134,35%,35%)] transition disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[hsl(134,35%,45%)] focus:ring-offset-2"
          >
            {isEditMode ? "Enregistrer les modifications" : "Créer l'utilisateur"}
          </button>
        </div>
      </div>
    </div>
  );
}