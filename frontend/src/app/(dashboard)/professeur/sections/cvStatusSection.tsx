"use client";

import { useState, useRef } from "react";
import { analyzeCV } from "@/lib/fastapi";
import {
  Upload, FileText, CheckCircle2, Loader2, X,
  User, Mail, Phone, GraduationCap, Briefcase,
  MapPin, Globe, Link2, Plus, Trash2,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
type UploadState = "idle" | "uploading" | "extracted" | "error";
type ActiveTab   = "upload" | "manual";

interface ExtractedField {
  label: string;
  value: string;
  confidence: number;
}

interface Experience {
  id: number;
  poste: string;
  entreprise: string;
  debut: string;
  fin: string;
  description: string;
}

interface Formation {
  id: number;
  diplome: string;
  etablissement: string;
  annee: string;
}

// ─── Mock données extraites ───────────────────────────────────────────────────
const mockExtracted: ExtractedField[] = [
  { label: "Prénom",     value: "Jean",                        confidence: 98 },
  { label: "Nom",        value: "Dupont",                      confidence: 98 },
  { label: "Email",      value: "j.dupont@cite.qc.ca",         confidence: 95 },
  { label: "Téléphone",  value: "613-555-0192",                confidence: 72 },
  { label: "Diplôme",    value: "Maîtrise en Informatique",    confidence: 91 },
  { label: "Expérience", value: "8 ans",                       confidence: 84 },
];

const confidenceColor = (c: number) =>
  c >= 90 ? "bg-emerald-400" : c >= 70 ? "bg-amber-400" : "bg-red-400";

// ─── Composant principal ──────────────────────────────────────────────────────
export default function CvStatusSection() {
  // Upload tab state
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [file, setFile]               = useState<File | null>(null);
  const [fields, setFields]           = useState<ExtractedField[]>([]);
  const [editValues, setEditValues]   = useState<Record<string, string>>({});
  const [isDragging, setIsDragging]   = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Tab state
  const [activeTab, setActiveTab] = useState<ActiveTab>("upload");

  // Manual form state
  const [manualForm, setManualForm] = useState({
    prenom:    "",
    nom:       "",
    email:     "",
    telephone: "",
    ville:     "",
    siteWeb:   "",
    linkedin:  "",
    resume:    "",
    competences: "",
    langues:   "",
  });

  const [experiences, setExperiences] = useState<Experience[]>([
    { id: 1, poste: "", entreprise: "", debut: "", fin: "", description: "" },
  ]);

  const [formations, setFormations] = useState<Formation[]>([
    { id: 1, diplome: "", etablissement: "", annee: "" },
  ]);

  const [manualSaved, setManualSaved] = useState(false);

  // ── Upload handlers ──────────────────────────────────────────────────────────
  const handleFile = async (f: File) => {
    if (
      !["application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ].includes(f.type)
    ) return;
    if (f.size > 5 * 1024 * 1024) return;

    setFile(f);
    setUploadState("uploading");

    try {
      // Appel réel à FastAPI via le client fastapi.js
      const result = await analyzeCV(f);
      const cvData = result.cv_data;

      // Transformation des données LLM en champs affichables
      const extracted: ExtractedField[] = [
        { label: "firstName",            value: cvData.firstName            || "", confidence: 95 },
        { label: "lastName",             value: cvData.lastName             || "", confidence: 95 },
        { label: "email",                value: cvData.email                || "", confidence: 95 },
        { label: "phone",                value: cvData.phone                || "", confidence: 80 },
        { label: "totalYearsExperience", value: String(cvData.totalYearsExperience || ""), confidence: 85 },
      ];

      setFields(extracted);
      setEditValues(Object.fromEntries(extracted.map((field) => [field.label, field.value])));
      setUploadState("extracted");

    } catch (error) {
      console.error("Erreur analyse CV :", error);
      setUploadState("error");
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const handleValidate = () => {
    // TODO: POST vers /api/cv/validate avec editValues
    setUploadState("idle");
    setFile(null);
    setFields([]);
  };

  // ── Manual form handlers ─────────────────────────────────────────────────────
  const updateManual = (key: string, value: string) =>
    setManualForm((prev) => ({ ...prev, [key]: value }));

  const addExperience = () =>
    setExperiences((prev) => [
      ...prev,
      { id: Date.now(), poste: "", entreprise: "", debut: "", fin: "", description: "" },
    ]);

  const updateExperience = (id: number, key: keyof Experience, value: string) =>
    setExperiences((prev) =>
      prev.map((exp) => (exp.id === id ? { ...exp, [key]: value } : exp))
    );

  const removeExperience = (id: number) =>
    setExperiences((prev) => prev.filter((exp) => exp.id !== id));

  const addFormation = () =>
    setFormations((prev) => [
      ...prev,
      { id: Date.now(), diplome: "", etablissement: "", annee: "" },
    ]);

  const updateFormation = (id: number, key: keyof Formation, value: string) =>
    setFormations((prev) =>
      prev.map((f) => (f.id === id ? { ...f, [key]: value } : f))
    );

  const removeFormation = (id: number) =>
    setFormations((prev) => prev.filter((f) => f.id !== id));

  const handleManualSubmit = () => {
    // TODO: POST vers /api/cv/manual avec { manualForm, experiences, formations }
    setManualSaved(true);
    setTimeout(() => setManualSaved(false), 3000);
  };

  // ── Shared styles ────────────────────────────────────────────────────────────
  const inputCls =
    "w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[hsl(134,35%,45%)] transition bg-white";

  const sectionTitle = (label: string) => (
    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 mt-1">
      {label}
    </p>
  );

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* ── Banner ── */}
      <div className="relative overflow-hidden rounded-3xl p-8 shadow-lg bg-gradient-to-br from-[hsl(134,35%,45%)] to-[#135d55]">
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/10 pointer-events-none" />
        <h1 className="relative text-2xl sm:text-3xl font-black text-white">Mon CV</h1>
        <p className="relative text-white/70 text-sm mt-1">
          Téléversez votre CV ou renseignez-le manuellement.
        </p>
      </div>

      {/* ── Onglets ── */}
      <div className="flex bg-slate-100 rounded-2xl p-1 gap-1">
        {(["upload", "manual"] as ActiveTab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all ${
              activeTab === tab
                ? "bg-white text-[hsl(134,35%,35%)] shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {tab === "upload" ? "📤 Téléverser un CV" : "✏️ Saisie manuelle"}
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          TAB — TÉLÉVERSEMENT
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === "upload" && (
        <>
          {/* Zone upload */}
          {uploadState !== "extracted" && (
            <div
              onClick={() => inputRef.current?.click()}
              onDrop={onDrop}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              className={`bg-white rounded-2xl border-2 border-dashed cursor-pointer transition-all p-12 flex flex-col items-center gap-4
                ${isDragging
                  ? "border-[hsl(134,35%,45%)] bg-emerald-50"
                  : "border-slate-200 hover:border-[hsl(134,35%,45%)]"
                }`}
            >
              <input
                ref={inputRef}
                type="file"
                accept=".pdf,.docx"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              />

              {uploadState === "uploading" ? (
                <>
                  <Loader2 className="w-10 h-10 text-[hsl(134,35%,45%)] animate-spin" />
                  <p className="text-sm font-semibold text-slate-600">Analyse IA en cours…</p>
                  <div className="w-48 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-[hsl(134,35%,45%)] rounded-full animate-pulse w-3/4" />
                  </div>
                </>
              ) : (
                <>
                  <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center">
                    <Upload className="w-6 h-6 text-[hsl(134,35%,45%)]" />
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-gray-700">Glissez votre CV ici</p>
                    <p className="text-xs text-slate-400 mt-1">PDF ou Word — max 5 MB</p>
                  </div>
                  {file && (
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <FileText className="w-3 h-3" />{file.name}
                    </p>
                  )}
                </>
              )}
            </div>
          )}

          {/* Résultats extraction */}
          {uploadState === "extracted" && (
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden">
              <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  <h2 className="text-lg font-semibold text-gray-700">Données extraites</h2>
                </div>
                <button
                  onClick={() => { setUploadState("idle"); setFile(null); }}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {fields.map((f) => (
                  <div key={f.label} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                        {f.label}
                      </label>
                      <div className="flex items-center gap-1.5">
                        <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${confidenceColor(f.confidence)}`}
                            style={{ width: `${f.confidence}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-bold text-slate-400">{f.confidence}%</span>
                      </div>
                    </div>
                    <input
                      value={editValues[f.label] ?? f.value}
                      onChange={(e) =>
                        setEditValues((p) => ({ ...p, [f.label]: e.target.value }))
                      }
                      className={inputCls}
                    />
                  </div>
                ))}
              </div>

              <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/40 flex justify-end gap-3">
                <button
                  onClick={() => { setUploadState("idle"); setFile(null); }}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition"
                >
                  Annuler
                </button>
                <button
                  onClick={handleValidate}
                  className="px-4 py-2 text-sm font-bold text-white bg-[hsl(134,35%,45%)] rounded-xl hover:bg-[hsl(134,35%,35%)] transition"
                >
                  Valider les données
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          TAB — SAISIE MANUELLE
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === "manual" && (
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden">

          {/* ── Informations personnelles ── */}
          <div className="px-6 pt-6 pb-2">
            {sectionTitle("Informations personnelles")}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1">
                  <User className="w-3 h-3" /> Prénom
                </label>
                <input
                  placeholder="Jean"
                  value={manualForm.prenom}
                  onChange={(e) => updateManual("prenom", e.target.value)}
                  className={inputCls}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1">
                  <User className="w-3 h-3" /> Nom
                </label>
                <input
                  placeholder="Dupont"
                  value={manualForm.nom}
                  onChange={(e) => updateManual("nom", e.target.value)}
                  className={inputCls}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1">
                  <Mail className="w-3 h-3" /> Email
                </label>
                <input
                  type="email"
                  placeholder="jean.dupont@email.com"
                  value={manualForm.email}
                  onChange={(e) => updateManual("email", e.target.value)}
                  className={inputCls}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1">
                  <Phone className="w-3 h-3" /> Téléphone
                </label>
                <input
                  type="tel"
                  placeholder="613-555-0192"
                  value={manualForm.telephone}
                  onChange={(e) => updateManual("telephone", e.target.value)}
                  className={inputCls}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> Ville / Région
                </label>
                <input
                  placeholder="Montréal, QC"
                  value={manualForm.ville}
                  onChange={(e) => updateManual("ville", e.target.value)}
                  className={inputCls}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1">
                  <Link2 className="w-3 h-3" /> LinkedIn
                </label>
                <input
                  placeholder="linkedin.com/in/jean-dupont"
                  value={manualForm.linkedin}
                  onChange={(e) => updateManual("linkedin", e.target.value)}
                  className={inputCls}
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1">
                  <Globe className="w-3 h-3" /> Site web / Portfolio
                </label>
                <input
                  placeholder="https://monportfolio.com"
                  value={manualForm.siteWeb}
                  onChange={(e) => updateManual("siteWeb", e.target.value)}
                  className={inputCls}
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                  Résumé / Profil professionnel
                </label>
                <textarea
                  rows={3}
                  placeholder="Décrivez votre profil en quelques phrases…"
                  value={manualForm.resume}
                  onChange={(e) => updateManual("resume", e.target.value)}
                  className={inputCls}
                />
              </div>

            </div>
          </div>

          <div className="mx-6 my-4 border-t border-slate-100" />

          {/* ── Expériences professionnelles ── */}
          <div className="px-6 pb-2">
            {sectionTitle("Expériences professionnelles")}
            <div className="space-y-4">
              {experiences.map((exp, idx) => (
                <div
                  key={exp.id}
                  className="relative border border-slate-100 rounded-2xl p-4 bg-slate-50/40 space-y-3"
                >
                  {/* Supprimer si plus d'une entrée */}
                  {experiences.length > 1 && (
                    <button
                      onClick={() => removeExperience(exp.id)}
                      className="absolute top-3 right-3 text-slate-300 hover:text-red-400 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}

                  <p className="text-xs font-bold text-[hsl(134,35%,45%)] uppercase tracking-widest">
                    Expérience {idx + 1}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1">
                        <Briefcase className="w-3 h-3" /> Poste occupé
                      </label>
                      <input
                        placeholder="Développeur fullstack"
                        value={exp.poste}
                        onChange={(e) => updateExperience(exp.id, "poste", e.target.value)}
                        className={inputCls}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                        Entreprise
                      </label>
                      <input
                        placeholder="Acme Inc."
                        value={exp.entreprise}
                        onChange={(e) => updateExperience(exp.id, "entreprise", e.target.value)}
                        className={inputCls}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                        Date de début
                      </label>
                      <input
                        type="month"
                        value={exp.debut}
                        onChange={(e) => updateExperience(exp.id, "debut", e.target.value)}
                        className={inputCls}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                        Date de fin
                      </label>
                      <input
                        type="month"
                        placeholder="Laissez vide si en cours"
                        value={exp.fin}
                        onChange={(e) => updateExperience(exp.id, "fin", e.target.value)}
                        className={inputCls}
                      />
                    </div>

                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                        Description des responsabilités
                      </label>
                      <textarea
                        rows={2}
                        placeholder="Décrivez vos missions et réalisations…"
                        value={exp.description}
                        onChange={(e) => updateExperience(exp.id, "description", e.target.value)}
                        className={inputCls}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={addExperience}
              className="mt-3 flex items-center gap-1.5 text-sm font-semibold text-[hsl(134,35%,45%)] hover:text-[hsl(134,35%,35%)] transition"
            >
              <Plus className="w-4 h-4" /> Ajouter une expérience
            </button>
          </div>

          <div className="mx-6 my-4 border-t border-slate-100" />

          {/* ── Formations ── */}
          <div className="px-6 pb-2">
            {sectionTitle("Formation")}
            <div className="space-y-4">
              {formations.map((f, idx) => (
                <div
                  key={f.id}
                  className="relative border border-slate-100 rounded-2xl p-4 bg-slate-50/40 space-y-3"
                >
                  {formations.length > 1 && (
                    <button
                      onClick={() => removeFormation(f.id)}
                      className="absolute top-3 right-3 text-slate-300 hover:text-red-400 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}

                  <p className="text-xs font-bold text-[hsl(134,35%,45%)] uppercase tracking-widest">
                    Formation {idx + 1}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1">
                        <GraduationCap className="w-3 h-3" /> Diplôme / Titre
                      </label>
                      <input
                        placeholder="Maîtrise en informatique"
                        value={f.diplome}
                        onChange={(e) => updateFormation(f.id, "diplome", e.target.value)}
                        className={inputCls}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                        Année d'obtention
                      </label>
                      <input
                        type="number"
                        placeholder="2020"
                        min={1950}
                        max={2099}
                        value={f.annee}
                        onChange={(e) => updateFormation(f.id, "annee", e.target.value)}
                        className={inputCls}
                      />
                    </div>

                    <div className="space-y-1 sm:col-span-3">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                        Établissement
                      </label>
                      <input
                        placeholder="Université de Montréal"
                        value={f.etablissement}
                        onChange={(e) => updateFormation(f.id, "etablissement", e.target.value)}
                        className={inputCls}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={addFormation}
              className="mt-3 flex items-center gap-1.5 text-sm font-semibold text-[hsl(134,35%,45%)] hover:text-[hsl(134,35%,35%)] transition"
            >
              <Plus className="w-4 h-4" /> Ajouter une formation
            </button>
          </div>

          <div className="mx-6 my-4 border-t border-slate-100" />

          {/* ── Compétences & Langues ── */}
          <div className="px-6 pb-2">
            {sectionTitle("Compétences & Langues")}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                  Compétences techniques
                </label>
                <textarea
                  rows={3}
                  placeholder="React, TypeScript, Python, Docker…"
                  value={manualForm.competences}
                  onChange={(e) => updateManual("competences", e.target.value)}
                  className={inputCls}
                />
                <p className="text-[10px] text-slate-400">Séparez les compétences par des virgules.</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                  Langues
                </label>
                <textarea
                  rows={3}
                  placeholder="Français (natif), Anglais (courant), Espagnol (intermédiaire)…"
                  value={manualForm.langues}
                  onChange={(e) => updateManual("langues", e.target.value)}
                  className={inputCls}
                />
                <p className="text-[10px] text-slate-400">Indiquez votre niveau entre parenthèses.</p>
              </div>
            </div>
          </div>

          {/* ── Footer ── */}
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/40 flex items-center justify-between gap-3 mt-4">
            {manualSaved ? (
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
                    prenom: "", nom: "", email: "", telephone: "",
                    ville: "", siteWeb: "", linkedin: "", resume: "",
                    competences: "", langues: "",
                  });
                  setExperiences([{ id: 1, poste: "", entreprise: "", debut: "", fin: "", description: "" }]);
                  setFormations([{ id: 1, diplome: "", etablissement: "", annee: "" }]);
                }}
                className="px-4 py-2 text-sm font-semibold text-slate-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition"
              >
                Réinitialiser
              </button>
              <button
                onClick={handleManualSubmit}
                className="px-4 py-2 text-sm font-bold text-white bg-[hsl(134,35%,45%)] rounded-xl hover:bg-[hsl(134,35%,35%)] transition"
              >
                Enregistrer le CV
              </button>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}