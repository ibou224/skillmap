"use client";

import { useState, useRef } from "react";
import { Upload, FileText, CheckCircle2, Loader2, X } from "lucide-react";
import { useCvs } from "@/hooks/useProfessor";
import { isValidFile } from "@/lib/validation";
import { normalizeField, buildStructuredData } from "@/lib/formatData";
import { initialCvData } from "@/constants/constantes";
import PersonalInfos from "../profil/PersonalInfos";
import { ExperiencesEditor } from "../experiences/ExperiencesEditor";
import { FormationsEditor } from "../formations/FormationsEditor";
import { StringArrayEditor } from "../skills/StringArrayEditor";
import { SkillsEditor } from "../skills/SkillsEditor";
import { CertificationsEditor } from "../certifications/CertificationsEditor";

export default function CvUploadSection({ onValidated }) {
  const [uploadState, setUploadState] = useState("idle");
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState(null);
  const [succesMessage, setSuccessMessage] = useState(null);
  const inputRef = useRef(null);
  const [cvData, setCvData] = useState(initialCvData);
  const { extractCV } = useCvs();

  const handleFile = async (f) => {
    const validation = isValidFile(f);
    if (!validation.valid) {
      setError(validation.message);
      return;
    }
    setFile(f);
    setUploadState("uploading");

    try {
      const result = await extractCV(f);
      if (!result?.success || !Array.isArray(result.data)) {
        throw new Error(result?.message || "Réponse invalide du serveur.");
      }
      const normalized = result.data.map((data) => normalizeField(data));
      const structuredData = buildStructuredData(normalized);
      setCvData(structuredData);
      setUploadState("extracted");
      setError(null);
      setSuccessMessage("CV analysé avec succès !");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setUploadState("error");
      setError("Erreur lors de l'analyse du CV.");
      setTimeout(() => {
        setUploadState("idle");
        setFile(null);
        setError(null);
      }, 3000);
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const handleValidate = () => {
    onValidated(cvData);
    setUploadState("idle");
    setFile(null);
    setCvData(initialCvData);
  };

  return (
    <>
      {/* ═══ Zone de dépôt / chargement / erreur ═══ */}
      {uploadState !== "extracted" && (
        <div
          onClick={() => inputRef.current?.click()}
          onDrop={onDrop}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          className={`bg-white rounded-2xl border-2 border-dashed cursor-pointer transition-all p-12 flex flex-col items-center gap-4 ${
            isDragging
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
              <p className="text-sm font-semibold text-slate-600">Televersement du cv en cours ...</p>
              <div className="w-48 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-[hsl(134,35%,45%)] rounded-full animate-pulse w-3/4" />
              </div>
            </>
          ) : uploadState === "error" ? (
            <div className="text-center">
              <X className="w-8 h-8 text-red-400 mx-auto mb-2" />
              <p className="text-red-700 font-semibold">{error}</p>
              <button
                onClick={(e) => { e.stopPropagation(); setUploadState("idle"); setFile(null); setError(null); }}
                className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 transition"
              >
                Réessayer
              </button>
            </div>
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
              {error && uploadState !== "error" && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <X className="w-3 h-3" />{error}
                </p>
              )}
            </>
          )}
        </div>
      )}

      {/* ═══ Résultats de l'extraction ═══ */}
      {uploadState === "extracted" && (
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden">
          {/* En-tête */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <h2 className="text-lg font-semibold text-gray-700">Fichier analysé avec succès</h2>
            </div>
            <button
              onClick={() => { setUploadState("idle"); setFile(null); }}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Message de succès temporaire */}
          {succesMessage && (
            <div className="mx-6 mt-4 px-4 py-2 bg-emerald-50 text-emerald-700 text-sm font-medium rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              {succesMessage}
            </div>
          )}

          {/* Formulaire d'édition */}
          <div className="p-6 space-y-6">
            <PersonalInfos
              data={cvData}
              onChange={(newData) => setCvData(newData)}
            />

            <div>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
                Compétences techniques
              </h3>
              <SkillsEditor
                items={cvData.competences}
                onChange={(newComp) => setCvData(prev => ({ ...prev, competences: newComp }))}
                placeholder="Ex : React, Node.js"
              />
            </div>

            <div>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
                Langues
              </h3>
              <StringArrayEditor
                items={cvData.langues}
                onChange={(newLang) => setCvData(prev => ({ ...prev, langues: newLang }))}
                placeholder="Ex : Français (natif)"
              />
            </div>

            <div>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
                Expériences professionnelles
              </h3>
              <ExperiencesEditor
                experiences={cvData.experiences}
                onChange={(newExps) => setCvData(prev => ({ ...prev, experiences: newExps }))}
              />
            </div>

            <div>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
                Formations
              </h3>
              <FormationsEditor
                formations={cvData.formations}
                onChange={(newForms) => setCvData(prev => ({ ...prev, formations: newForms }))}
              />
            </div>

            {cvData.certifications?.length > 0 && (
              <div>
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
                  Certifications
                </h3>
                <CertificationsEditor
                  certifications={cvData.certifications}
                  onChange={(newCerts) => setCvData(prev => ({ ...prev, certifications: newCerts }))}
                />
              </div>
            )}
          </div>

          {/* Boutons d'action */}
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
  );
}