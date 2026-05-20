// pages/cv.jsx
"use client";
import { useState } from "react";
import CvUploadSection from "../components/CvUploadSection";
import CvManualSection from "../components/CvManualSection";

export default function CvPage() {
  const [activeTab, setActiveTab] = useState("upload");

  const handleUploadValidated = (editValues) => {
    // TODO: POST vers /api/cv/validate avec editValues
    console.log("Upload validated", editValues);
  };

  const handleManualSave = (data) => {
    // TODO: POST vers /api/cv/manual avec data (manualForm, experiences, formations)
    console.log("Manual saved", data);
  };

  return (
    <div className="space-y-6">
      {/* Bannière */}
      <div className="relative overflow-hidden rounded-3xl p-8 shadow-lg bg-gradient-to-br from-[hsl(134,35%,45%)] to-[#135d55]">
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
      {activeTab === "manual" && <CvManualSection onSave={handleManualSave} />}
    </div>
  );
}