// pages/cv.jsx
"use client";

/**
 * @module features/professeur/cvStatutSection
 * @description Section professeur de gestion du CV : bascule entre import de
 * fichier (extraction IA) et saisie manuelle, selon le paramètre d'URL `tab`.
 * @returns {ReactNode} La section de gestion du CV.
 */

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import CvUploadSection from "@/components/professeur/cv/CvUploadSection";
import CvManualSection from "@/components/professeur/cv/CvManualSection";
import {useCvs} from "@/hooks/useProfessor";


export default function CvPage() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState(
    searchParams.get("tab") === "manual" ? "manual" : "upload"
  );
  const [pendingCvData, setPendingCvData] = useState(null);
  const [formKey, setFormKey] = useState(0);
  const { saveInfos, isSaving, infos, isLoadingInfos, fetchInfos } = useCvs();

  useEffect(() => { fetchInfos(); }, [fetchInfos]);

 const handleUploadValidated = async (cvData) => {
   // Pré-remplir le formulaire manuel et basculer immédiatement
   setPendingCvData(cvData);
   setFormKey((k) => k + 1);
   setActiveTab("manual");

   // Fusionner certifications → formations avec niveauDiplome CERTIFICATION
   const certAsFormations = (cvData.certifications ?? []).map((c) => ({
     diplome:        c.title ?? "",
     etablissement:  "",
     anneeObtention: c.year ? String(c.year) : String(new Date().getFullYear()),
     niveauDiplome:  "CERTIFICATION",
   }));

   // Sauvegarder en arrière-plan
   await saveInfos({
     profile: {
       titre: cvData.titre,
       email: cvData.email,
       telephone: cvData.telephone,
       ville: cvData.ville,
       siteWeb: cvData.siteWeb,
       linkedin: cvData.linkedin,
       github: cvData.github,
       resume: cvData.resume,
       langues: cvData.langues ?? [],
     },
     experiences: cvData.experiences,
     formations: [...(cvData.formations ?? []), ...certAsFormations],
     competences: (cvData.competences ?? []).map((comp) => ({
       nom: comp.nom,
       categorie: "autre",
       niveau: comp.niveau ?? "DEBUTANT",
       anneesExp: comp.anneesExp ?? 0,
       source: "EXTRACTION_IA",
     })),
   });
 };

const handleManualSave = async (cvData) => {
  const certAsFormations = (cvData.certifications ?? []).map((c) => ({
    diplome:        c.title ?? "",
    etablissement:  "",
    anneeObtention: c.year ? String(c.year) : String(new Date().getFullYear()),
    niveauDiplome:  "CERTIFICATION",
  }));

  await saveInfos({
    profile: {
      titre: cvData.titre,
      telephone: cvData.telephone,
      ville: cvData.ville,
      siteWeb: cvData.siteWeb,
      linkedin: cvData.linkedin,
      github: cvData.github,
      email: cvData.email,
      resume: cvData.resume,
      langues: cvData.langues ?? [],
    },
    experiences: cvData.experiences,
    formations: [...(cvData.formations ?? []), ...certAsFormations],
    competences: (cvData.competences ?? []).map((comp) => ({
      nom: comp.nom,
      categorie: "autre",
      niveau: comp.niveau ?? "DEBUTANT",
      anneesExp: 0,
      source: "SAISIE_MANUELLE",
    })),
  });
};


  return (
    <div className="space-y-6">
      {/* Bannière */}
      <div className="relative overflow-hidden rounded-3xl p-8 shadow-lg bg-linear-to-br from-[hsl(134,35%,45%)] to-[#135d55]">
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/10 pointer-events-none" />
        <h1 className="relative text-2xl sm:text-3xl font-black text-white">Mon CV</h1>
        <p className="relative text-white/70 text-sm mt-1">Téléversez votre CV ou renseignez-le manuellement.</p>
      </div>

      {/* Onglets */}
      <div className="flex bg-slate-100 rounded-2xl p-1 gap-1">
        {["upload", "manual"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all ${
              activeTab === tab ? "bg-white text-[hsl(134,35%,35%)] shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {tab === "upload" ? "📤 Téléverser votre CV" : "✏️ Saisie manuelle"}
          </button>
        ))}
      </div>

      {/* Contenu */}
      {activeTab === "upload" && <CvUploadSection onValidated={handleUploadValidated} />}
      {activeTab === "manual" && (
        isLoadingInfos
          ? <div className="flex justify-center py-20"><div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>
          : <CvManualSection
              key={formKey}
              onSave={handleManualSave}
              initialData={pendingCvData ?? infos}
            />
      )}
    </div>
  );
}