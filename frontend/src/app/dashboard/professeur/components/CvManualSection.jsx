"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import PersonalInfos from "./PersonalInfos";
import { ExperiencesEditor } from "./ExperiencesEditor";
import { FormationsEditor } from "./FormationsEditor";
import { StringArrayEditor } from "./StringArrayEditor";

export default function CvManualSection({ onSave }) {
  const [manualForm, setManualForm] = useState({
    prenom: "",
    nom: "",
    email: "",
    telephone: "",
    ville: "",
    siteWeb: "",
    linkedin: "",
    resume: "",
    competences: [],
    langues: [],
  });

  const [experiences, setExperiences] = useState([
    { id: 1, poste: "", entreprise: "", debut: "", fin: "", description: "" },
  ]);

  const [formations, setFormations] = useState([
    { id: 1, diplome: "", etablissement: "", anneeObtention: "" },
  ]);

  const [saved, setSaved] = useState(false);

  const handleSubmit = () => {
    // Combine les données en un seul objet structuré, comme pour le téléversement
    const cvData = {
      ...manualForm,
      experiences,
      formations,
    };
    onSave(cvData);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden">
      {/* Informations personnelles */}
      <PersonalInfos
        data={manualForm}
        onChange={(newData) => setManualForm(newData)}
      />

      <Divider />

      {/* Compétences (tableau éditable) */}
      <div className="px-6 pb-2">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 mt-1">
          Compétences & Langues
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1 block">
              Compétences techniques
            </label>
            <StringArrayEditor
              items={manualForm.competences}
              onChange={(newComp) =>
                setManualForm((prev) => ({ ...prev, competences: newComp }))
              }
              placeholder="Ex : React, Node.js"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1 block">
              Langues
            </label>
            <StringArrayEditor
              items={manualForm.langues}
              onChange={(newLang) =>
                setManualForm((prev) => ({ ...prev, langues: newLang }))
              }
              placeholder="Ex : Français (natif)"
            />
          </div>
        </div>
      </div>

      <Divider />

      {/* Expériences professionnelles */}
      <div className="px-6 pb-2">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 mt-1">
          Expériences professionnelles
        </p>
        <ExperiencesEditor
          experiences={experiences}
          onChange={(newExps) => setExperiences(newExps)}
        />
      </div>

      <Divider />

      {/* Formations */}
      <div className="px-6 pb-2">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 mt-1">
          Formations
        </p>
        <FormationsEditor
          formations={formations}
          onChange={(newForms) => setFormations(newForms)}
        />
      </div>

      <Divider />

      {/* Footer */}
      <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/40 flex items-center justify-between gap-3 mt-4">
        {saved ? (
          <span className="flex items-center gap-1.5 text-sm font-semibold text-emerald-600">
            <CheckCircle2 className="w-4 h-4" /> CV enregistré avec succès !
          </span>
        ) : (
          <span />
        )}
        <div className="flex gap-3">
          <button
            onClick={() => {
              setManualForm({
                prenom: "",
                nom: "",
                email: "",
                telephone: "",
                ville: "",
                siteWeb: "",
                linkedin: "",
                resume: "",
                competences: [],
                langues: [],
              });
              setExperiences([
                { id: 1, poste: "", entreprise: "", debut: "", fin: "", description: "" },
              ]);
              setFormations([
                { id: 1, diplome: "", etablissement: "", anneeObtention: "" },
              ]);
            }}
            className="px-4 py-2 text-sm font-semibold text-slate-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition"
          >
            Réinitialiser
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 text-sm font-bold text-white bg-[hsl(134,35%,45%)] rounded-xl hover:bg-[hsl(134,35%,35%)] transition"
          >
            Enregistrer le CV
          </button>
        </div>
      </div>
    </div>
  );
}

function Divider() {
  return <div className="mx-6 my-4 border-t border-slate-100" />;
}