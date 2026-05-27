"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import PersonalInfos from "../profil/PersonalInfos";
import { ExperiencesEditor } from "../experiences/ExperiencesEditor";
import { FormationsEditor } from "../formations/FormationsEditor";
import { StringArrayEditor } from "../skills/StringArrayEditor";
import { SkillsEditor } from "../skills/SkillsEditor";

export default function CvManualSection({ onSave, initialData = null }) {
  const [manualForm, setManualForm] = useState({
    prenom:     initialData?.prenom     ?? "",
    nom:        initialData?.nom        ?? "",
    email:      initialData?.email      ?? "",
    telephone:  initialData?.telephone  ?? "",
    ville:      initialData?.ville      ?? "",
    siteWeb:    initialData?.siteWeb    ?? "",
    linkedin:   initialData?.linkedin   ?? "",
    resume:     initialData?.resume     ?? "",
    competences: initialData?.competences ?? [],
    langues:    initialData?.langues    ?? [],
  });

  const [experiences, setExperiences] = useState(
    initialData?.experiences?.length
      ? initialData.experiences.map((e, i) => ({ id: i + 1, ...e }))
      : [{ id: 1, poste: "", entreprise: "", debut: "", fin: "", description: "" }]
  );

  const [formations, setFormations] = useState(
    initialData?.formations?.length
      ? initialData.formations.map((f, i) => ({ id: i + 1, ...f }))
      : [{ id: 1, diplome: "", etablissement: "", anneeObtention: "" }]
  );

  const [saved, setSaved] = useState(false);
  const [prevInitialData, setPrevInitialData] = useState(null);

  // Synchronise les champs quand initialData change (chargement async)
  if (initialData !== prevInitialData && initialData) {
    setPrevInitialData(initialData);
    setManualForm({
      prenom:      initialData.prenom     ?? "",
      nom:         initialData.nom        ?? "",
      email:       initialData.email      ?? "",
      telephone:   initialData.telephone  ?? "",
      ville:       initialData.ville      ?? "",
      siteWeb:     initialData.siteWeb    ?? "",
      linkedin:    initialData.linkedin   ?? "",
      resume:      initialData.resume     ?? "",
      competences: initialData.competences ?? [],
      langues:     initialData.langues    ?? [],
    });
    setExperiences(
      initialData.experiences?.length
        ? initialData.experiences.map((e, i) => ({ id: i + 1, ...e }))
        : [{ id: 1, poste: "", entreprise: "", debut: "", fin: "", description: "" }]
    );
    setFormations(
      initialData.formations?.length
        ? initialData.formations.map((f, i) => ({ id: i + 1, ...f }))
        : [{ id: 1, diplome: "", etablissement: "", anneeObtention: "" }]
    );
  }

  const handleSubmit = () => {
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
            <SkillsEditor
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