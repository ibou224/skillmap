"use client";

import { useState, useEffect, useCallback } from "react";
import {Edit3, FileText} from "lucide-react";
import Link from "next/link";
import CoordonneProfil  from "../components/CoordonneProfil";
import FormationList from "../components/FormationList";
import ExperienceTimeline from "../components/ExperienceTimeline";
import SkillsList from "../components/SkillsList";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";
import SectionCard from "@/components/ui/SectionCard";
import ProfileHeader from "../components/ProfileHeader";


export default function ProfilPage() {
  const [cvData, setCvData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);

  const fetchCV = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/professeur/cv");
      if (!res.ok) throw new Error("Impossible de charger le CV");
      setCvData(await res.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      setCvData({
        prenom: "Marie", 
        nom: "Dupont",
        email: "marie.dupont@cegep.qc.ca",
        telephone: "613-555-0192",
        ville: "Montréal, QC",
        siteWeb: "https://mariedupont.dev",
        linkedin: "https://linkedin.com/in/mariedupont",
        resume: "Professeure d'informatique passionnée avec plus de 8 ans d'expérience en développement logiciel. Spécialisée en programmation Web et en intelligence artificielle.",
        competences: ["React","Node.js","Python","SQL","Docker","Enseignement","Gestion de projet"],
        langues: ["Français (natif)","Anglais (courant)","Espagnol (intermédiaire)"],
        experiences: [
          { poste:"Professeure en informatique", entreprise:"Cégep de Saint-Hyacinthe", debut:"2020-09", fin:"", description:"Enseignement des cours de programmation Web, base de données et IA. Développement de matériel pédagogique." },
          { poste:"Développeuse fullstack", entreprise:"Solutions Web Inc.", debut:"2016-01", fin:"2020-08", description:"Conception et développement d'applications web pour des clients variés. Mise en place de pipelines CI/CD." },
        ],
        formations: [
          { diplome:"Maîtrise en informatique", etablissement:"Université de Montréal", anneeObtention:"2015" },
          { diplome:"Baccalauréat en génie logiciel", etablissement:"Université Laval", anneeObtention:"2012" },
        ],
      });
      setLoading(false);
    }, 500);
    return () => clearTimeout(t);
  }, []);

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
        totalExp={cvData.experiences.length}
        competencesCount={cvData.competences.length}
        formationsCount={cvData.formations.length}
        languesCount={cvData.langues.length}
        onRefresh={fetchCV}
        />

      {/* ── GRILLE PRINCIPALE ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
        
        {/* ─ Colonne gauche ─ */}
        <div className="space-y-5">
          {/* Avatar + coordonnées */}
         <CoordonneProfil user={cvData} />
          {/* Langues */}
          <SectionCard title="Langues" dotColor="bg-blue-300">
            <SkillsList items={cvData.langues} variant="blue" emptyMessage="Aucune langue renseignée." />
          </SectionCard>
        </div>

        {/* ─ Colonne droite ─ */}
        <div className="lg:col-span-2 space-y-5">
          {/* Résumé */}
          <SectionCard title="Résumé professionnel">
            <p className="text-[13.5px] text-slate-500 leading-relaxed font-light">
              {cvData.resume || "Aucun résumé renseigné."}
            </p>
          </SectionCard>

          {/* Compétences */}
            <SectionCard title="Compétences" dotColor="bg-blue-300">
                <SkillsList items={cvData.competences} variant="green" emptyMessage="Aucune compétence renseignée." />
            </SectionCard>

          {/* Expériences */}
            <SectionCard title="Expériences professionnelles">
                <ExperienceTimeline experiences={cvData.experiences} />
            </SectionCard>

          {/* Formations */}
            <SectionCard title="Formations" dotColor="bg-amber-400">
                <FormationList formations={cvData.formations} />
            </SectionCard>
        </div>
      </div>
    </div>
  );
}