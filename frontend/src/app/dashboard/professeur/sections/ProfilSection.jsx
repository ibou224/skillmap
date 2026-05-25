"use client";

import { useEffect } from "react";
import { Edit3, FileText } from "lucide-react";
import Link from "next/link";
import CoordonneProfil from "../components/CoordonneProfil";
import FormationList from "../components/FormationList";
import ExperienceTimeline from "../components/ExperienceTimeline";
import SkillsList from "../components/SkillsList";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";
import SectionCard from "@/components/ui/SectionCard";
import ProfileHeader from "../components/ProfileHeader";
import { useCvs } from "@/hooks/useProfessor";


export default function ProfilPage() {
  const {
    infos: cvData,
    isLoadingInfos: loading,
    infosError: error,
    fetchInfos,
  } = useCvs();

  useEffect(() => {
    fetchInfos();
  }, [fetchInfos]);

  if (loading) return <LoadingSkeleton />;

  if (!cvData || (!cvData.resume && !cvData.competences?.length && !cvData.experiences?.length)) return (
    <div className="text-center py-20 max-w-sm mx-auto">
      <FileText className="w-10 h-10 text-slate-200 mx-auto mb-4" />
      <h2 className="text-lg font-semibold text-slate-700 mb-2">Aucun CV enregistré</h2>
      <p className="text-xs text-slate-400 mb-6 leading-relaxed">Vous n'avez pas encore créé votre CV. Cliquez ci-dessous pour commencer.</p>
      <Link href="/dashboard/professeur/cv" className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white text-xs font-semibold rounded-xl hover:bg-emerald-700 transition">
        <Edit3 className="w-3.5 h-3.5" /> Créer mon CV
      </Link>
    </div>
  );

  return (
    <div className="space-y-5">

      {/* ── EN-TÊTE ── */}
      <ProfileHeader
        prenom={cvData.prenom}
        nom={cvData.nom}
        totalExp={cvData.experiences?.length ?? 0}
        competencesCount={cvData.competences?.length ?? 0}
        formationsCount={cvData.formations?.length ?? 0}
        languesCount={cvData.langues?.length ?? 0}
        onRefresh={fetchInfos}
      />

      {/* ── GRILLE PRINCIPALE ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">

        {/* ─ Colonne gauche ─ */}
        <div className="space-y-5">
          <CoordonneProfil user={cvData} />
          <SectionCard title="Langues" dotColor="bg-blue-300">
            <SkillsList items={cvData.langues} variant="blue" emptyMessage="Aucune langue renseignée." />
          </SectionCard>
        </div>

        {/* ─ Colonne droite ─ */}
        <div className="lg:col-span-2 space-y-5">
          <SectionCard title="Résumé professionnel">
            <p className="text-[13.5px] text-slate-500 leading-relaxed font-light">
              {cvData.resume || "Aucun résumé renseigné."}
            </p>
          </SectionCard>

          <SectionCard title="Compétences" dotColor="bg-blue-300">
            <SkillsList items={cvData.competences} variant="green" emptyMessage="Aucune compétence renseignée." />
          </SectionCard>

          <SectionCard title="Expériences professionnelles">
            <ExperienceTimeline experiences={cvData.experiences} />
          </SectionCard>

          <SectionCard title="Formations" dotColor="bg-amber-400">
            <FormationList formations={cvData.formations} />
          </SectionCard>
        </div>
      </div>
    </div>
  );
}