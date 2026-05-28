"use client";

import { useState } from "react";
import PersonalInfos from "../profil/PersonalInfos";
import Toast from "@/components/affectations/Toast";
import { ExperiencesEditor } from "../experiences/ExperiencesEditor";
import { FormationsEditor } from "../formations/FormationsEditor";
import { StringArrayEditor } from "../skills/StringArrayEditor";
import { SkillsEditor } from "../skills/SkillsEditor";
import { CertificationsEditor } from "../certifications/CertificationsEditor";

const EMPTY = {
  prenom: "", nom: "", email: "", telephone: "",
  ville: "", siteWeb: "", linkedin: "", github: "", resume: "",
  competences: [], langues: [], certifications: [],
  experiences: [], formations: [],
};

export default function CvManualSection({ onSave, initialData = null }) {
  const [form, setForm] = useState({ ...EMPTY, ...initialData });

  const [toast, setToast] = useState(null);

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async () => {
    try {
      await onSave(form);
      setToast({ message: "CV enregistré avec succès !", type: "success" });
      setForm(EMPTY);
    } catch {
      setToast({ message: "Erreur lors de l'enregistrement du CV.", type: "error" });
    }
  };

  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden">
      <PersonalInfos
        data={form}
        onChange={(newData) => setForm((prev) => ({ ...prev, ...newData }))}
      />

      <Divider />

      <div className="px-6 pb-2">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 mt-1">
          Compétences & Langues
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1 block">
              Compétences techniques
            </label>
            <SkillsEditor
              items={form.competences}
              onChange={(v) => update("competences", v)}
              placeholder="Ex : React, Node.js"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1 block">
              Langues
            </label>
            <StringArrayEditor
              items={form.langues}
              onChange={(v) => update("langues", v)}
              placeholder="Ex : Français (natif)"
            />
          </div>
        </div>
      </div>

      <Divider />

      <div className="px-6 pb-2">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 mt-1">
          Expériences professionnelles
        </p>
        <ExperiencesEditor
          experiences={form.experiences}
          onChange={(v) => update("experiences", v)}
        />
      </div>

      <Divider />

      <div className="px-6 pb-2">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 mt-1">
          Formations
        </p>
        <FormationsEditor
          formations={form.formations}
          onChange={(v) => update("formations", v)}
        />
      </div>

      <Divider />

      <div className="px-6 pb-2">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 mt-1">
          Certifications
        </p>
        <CertificationsEditor
          certifications={form.certifications}
          onChange={(v) => update("certifications", v)}
        />
      </div>

      <Divider />

      <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/40 flex justify-end gap-3">
        <button
          onClick={() => setForm(EMPTY)}
          className="px-4 py-2 text-sm font-semibold text-slate-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition cursor-pointer"
        >
          Réinitialiser
        </button>
        <button
          onClick={handleSubmit}
          className="px-4 py-2 text-sm font-bold text-white bg-[hsl(134,35%,45%)] rounded-xl cursor-pointer hover:bg-[hsl(134,35%,35%)] transition"
        >
          Enregistrer le CV
        </button>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

function Divider() {
  return <div className="mx-6 my-4 border-t border-slate-100" />;
}
