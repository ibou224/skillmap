"use client";

/**
 * @module features/professeur/ProfilSection
 * @description Section professeur d'affichage du profil complet (coordonnées,
 * formations, expériences, compétences), via {@link module:hooks/useProfessor}.
 * @returns {ReactNode} La section de profil du professeur.
 */

import { useEffect } from "react";
import { Edit3, FileText } from "lucide-react";
import Link from "next/link";
import CoordonneProfil from "@/components/professeur/profil/CoordonneProfil";
import FormationList from "@/components/professeur/formations/FormationList";
import ExperienceTimeline from "@/components/professeur/experiences/ExperienceTimeline";
import SkillsList from "@/components/professeur/skills/SkillsList";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";
import SectionCard from "@/components/ui/SectionCard";
import ProfileHeader from "@/components/professeur/profil/ProfileHeader";
import { useCvs } from "@/hooks/useProfessor";

export default function ProfilPage() {
  const {
    infos: cvData,
    isLoadingInfos: loading,
    fetchInfos,
  } = useCvs();

  useEffect(() => { fetchInfos(); }, [fetchInfos]);

  if (loading) return <LoadingSkeleton />;

  if (!cvData || (!cvData.resume && !cvData.competences?.length && !cvData.experiences?.length)) {
    return (
      <div className="text-center py-20 max-w-sm mx-auto">
        <FileText className="w-10 h-10 text-slate-200 mx-auto mb-4" />
        <h2 className="text-lg font-semibold text-slate-700 mb-2">Aucun CV enregistré</h2>
        <p className="text-xs text-slate-400 mb-6 leading-relaxed">
          Vous n&apos;avez pas encore créé votre CV. Cliquez ci-dessous pour commencer.
        </p>
        <Link
          href="/dashboard/professeur/cv"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white text-xs font-semibold rounded-xl hover:bg-emerald-700 transition"
        >
          <Edit3 className="w-3.5 h-3.5" /> Créer mon CV
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <ProfileHeader professeur={cvData} onRefresh={fetchInfos} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">

        {/* ── Colonne gauche ── */}
        <div className="space-y-5">
          <CoordonneProfil user={cvData} />

          <SectionCard title="Compétences" dotColor="bg-blue-400">
            <SkillsList items={cvData.competences} variant="green" emptyMessage="Aucune compétence renseignée." />
          </SectionCard>

          <SectionCard title="Langues" dotColor="bg-slate-300">
            <SkillsList items={cvData.langues} variant="blue" emptyMessage="Aucune langue renseignée." />
          </SectionCard>
        </div>

        {/* ── Colonne droite (2/3) ── */}
        <div className="lg:col-span-2 space-y-5">
          <SectionCard title="Résumé professionnel">
            <p className="text-[13.5px] text-slate-500 leading-relaxed font-light">
              {cvData.resume || "Aucun résumé renseigné."}
            </p>
          </SectionCard>

          <SectionCard title="Expériences professionnelles">
            <ExperienceTimeline experiences={cvData.experiences} />
          </SectionCard>

          <SectionCard title="Formations & certifications" dotColor="bg-amber-400">
            <FormationList
              formations={[
                ...(cvData.formations ?? []),
                ...(cvData.certifications ?? []).map((c) => ({
                  diplome:        c.title ?? "",
                  etablissement:  "",
                  anneeObtention: c.year ? String(c.year) : "",
                  niveauDiplome:  "CERTIFICATION",
                })),
              ]}
            />
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
