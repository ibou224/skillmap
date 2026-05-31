"use client";

import { useEffect, useState, useCallback } from "react";
import {
  X, Mail, Phone, MapPin, Globe, User2,
  RefreshCw, AlertCircle, Briefcase, GraduationCap,
  Lightbulb, Languages, FileText
} from "lucide-react";
import { NIVEAU_LABEL, DIPLOME_LABEL, CV_STATUT_META } from "@/constants/cvConstantes";
import { fmtPeriod, SectionTitle, NiveauBar, TimelineDot } from "./CvModalComponents";
import { useCvs } from "@/hooks/useProfessor";

/**
 * @module components/cv/CvModal
 * @description Modale d'affichage détaillé du CV d'un professeur (coordonnées,
 * expériences, formations, compétences, langues) chargé depuis l'API de détail.
 */

/**
 * Modale de consultation du CV complet d'un professeur.
 * @param {Object} props
 * @param {string} props.professorId - Identifiant du professeur à charger.
 * @param {Function} props.onClose - Callback de fermeture de la modale.
 * @returns {JSX.Element} La modale CV.
 */
export default function CvModal({ professorId, onClose }) {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const { fetchProfessorById } = useCvs();

  const fetchData = useCallback(async () => {
    if (!professorId) return;
    setLoading(true);
    setError(null);
    try {
      const result = await fetchProfessorById(professorId);
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [professorId, fetchProfessorById]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchData(); }, [fetchData]);

  const initials = data
    ? `${data.prenom?.[0] ?? ""}${data.nom?.[0] ?? ""}`.toUpperCase()
    : "—";

  const statutMeta = data?.cvStatut ? CV_STATUT_META[data.cvStatut] : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Fenêtre modale */}
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-3xl shadow-2xl bg-white flex flex-col">

        {/* ── Bouton fermer ── */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center text-white transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* ── État chargement ── */}
        {loading && (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 py-24">
            <RefreshCw className="w-8 h-8 text-[hsl(134,35%,45%)] animate-spin" />
            <p className="text-sm text-slate-400">Chargement du CV…</p>
          </div>
        )}

        {/* ── État erreur ── */}
        {!loading && error && (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 py-24">
            <AlertCircle className="w-8 h-8 text-red-400" />
            <p className="text-sm text-red-500 font-medium">{error}</p>
            <button
              onClick={fetchData}
              className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-semibold transition"
            >
              Réessayer
            </button>
          </div>
        )}

        {/* ── CV ── */}
        {!loading && !error && data && (
          <div className="overflow-y-auto flex-1">

            {/* ── Header gradient ── */}
            <div className="relative overflow-hidden bg-linear-to-br from-[hsl(134,35%,45%)] to-[#0e4d47] px-8 pt-8 pb-6">
              {/* Cercles décoratifs */}
              <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-white/5 pointer-events-none" />
              <div className="absolute -bottom-20 -left-10 w-48 h-48 rounded-full bg-white/5 pointer-events-none" />
              <div className="absolute top-4 right-32 w-24 h-24 rounded-full bg-white/5 pointer-events-none" />

              <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-6">

                {/* Avatar initiales */}
                <div className="w-24 h-24 rounded-2xl bg-white/15 border-2 border-white/30 text-white text-4xl font-black flex items-center justify-center select-none shrink-0 shadow-lg">
                  {initials}
                </div>

                {/* Infos principales */}
                <div className="flex-1 min-w-0">
                  <p className="text-white/50 text-[10px] font-bold uppercase tracking-[0.2em] mb-1">
                    Professeur
                  </p>
                  <h1 className="text-3xl font-black text-white tracking-tight leading-none truncate">
                    {data.prenom} {data.nom}
                  </h1>

                  {/* Contacts */}
                  <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
                    {data.email && (
                      <span className="inline-flex items-center gap-1.5 text-white/70 text-xs">
                        <Mail className="w-3 h-3 shrink-0" /> {data.email}
                      </span>
                    )}
                    {data.telephone && (
                      <span className="inline-flex items-center gap-1.5 text-white/70 text-xs">
                        <Phone className="w-3 h-3 shrink-0" /> {data.telephone}
                      </span>
                    )}
                    {data.ville && (
                      <span className="inline-flex items-center gap-1.5 text-white/70 text-xs">
                        <MapPin className="w-3 h-3 shrink-0" /> {data.ville}
                      </span>
                    )}
                    {data.siteWeb && (
                      <span className="inline-flex items-center gap-1.5 text-white/70 text-xs">
                        <Globe className="w-3 h-3 shrink-0" /> {data.siteWeb}
                      </span>
                    )}
                    {data.linkedin && (
                      <span className="inline-flex items-center gap-1.5 text-white/70 text-xs">
                        <User2 className="w-3 h-3 shrink-0" /> {data.linkedin}
                      </span>
                    )}
                  </div>
                </div>

                {/* Badge statut */}
                {statutMeta && (
                  <div className={`self-start sm:self-auto shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${statutMeta.bg} ${statutMeta.text}`}>
                    <statutMeta.icon className="w-3.5 h-3.5" />
                    {statutMeta.label}
                  </div>
                )}
              </div>

              {/* Barre de stats */}
              <div className="relative mt-5 pt-4 border-t border-white/10 grid grid-cols-4 gap-3">
                {[
                  { label: "Compétences", value: data.competences?.length ?? 0 },
                  { label: "Expériences", value: data.experiences?.length  ?? 0 },
                  { label: "Formations",  value: data.formations?.length   ?? 0 },
                  { label: "Langues",     value: data.langues?.length      ?? 0 },
                ].map(({ label, value }) => (
                  <div key={label} className="text-center">
                    <p className="text-2xl font-black text-white tabular-nums leading-none">{value}</p>
                    <p className="text-[10px] text-white/50 mt-1">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Corps du CV ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-slate-100">

              {/* ── Colonne gauche ── */}
              <div className="p-6 space-y-6 bg-slate-50/50">

                {/* Résumé / Profil */}
                {data.resume && (
                  <div>
                    <SectionTitle icon={FileText}>Profil</SectionTitle>
                    <p className="text-xs text-slate-500 leading-relaxed">{data.resume}</p>
                  </div>
                )}

                {/* Compétences */}
                {data.competences?.length > 0 && (
                  <div>
                    <SectionTitle icon={Lightbulb}>Compétences</SectionTitle>
                    <div className="space-y-2.5">
                      {data.competences.map((c, i) => (
                        <div key={i}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium text-slate-700 truncate pr-2">{c.nom}</span>
                            <span className="text-[10px] text-slate-400 shrink-0">{NIVEAU_LABEL[c.niveau] ?? c.niveau}</span>
                          </div>
                          <NiveauBar niveau={c.niveau} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Langues */}
                {data.langues?.length > 0 && (
                  <div>
                    <SectionTitle icon={Languages}>Langues</SectionTitle>
                    <div className="space-y-2">
                      {data.langues.map((lang, i) => {
                        const nom    = typeof lang === "string" ? lang : (lang.nom ?? lang.langue ?? lang.name ?? "");
                        const niveau = typeof lang === "string" ? null : (lang.niveau ?? null);
                        return (
                          <div key={i} className="flex items-center justify-between">
                            <span className="text-xs font-medium text-slate-700">{nom}</span>
                            {niveau && <span className="text-[10px] text-slate-400">{niveau}</span>}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Aucun contenu gauche */}
                {!data.resume && !data.competences?.length && !data.langues?.length && (
                  <p className="text-xs text-slate-300 italic">Aucune information renseignée.</p>
                )}
              </div>

              {/* ── Colonne droite ── */}
              <div className="lg:col-span-2 p-6 space-y-6">

                {/* Formations */}
                {data.formations?.length > 0 && (
                  <div>
                    <SectionTitle icon={GraduationCap}>Formation</SectionTitle>
                    <div className="space-y-0">
                      {data.formations.map((f, i) => (
                        <div key={i} className="flex gap-3">
                          <TimelineDot />
                          <div className="pb-5 flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 flex-wrap">
                              <div>
                                <p className="text-sm font-bold text-slate-800">{DIPLOME_LABEL[f.diplome] ?? f.diplome ?? "Diplôme"}</p>
                                <p className="text-xs text-slate-500 mt-0.5">{f.etablissement}</p>
                              </div>
                              {f.anneeObtention && (
                                <span className="text-[10px] font-semibold text-[hsl(134,35%,45%)] bg-emerald-50 px-2 py-0.5 rounded-full shrink-0">
                                  {f.anneeObtention}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Expériences */}
                {data.experiences?.length > 0 && (
                  <div>
                    <SectionTitle icon={Briefcase}>Expérience professionnelle</SectionTitle>
                    <div className="space-y-0">
                      {data.experiences.map((exp, i) => (
                        <div key={i} className="flex gap-3">
                          <TimelineDot />
                          <div className="pb-5 flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 flex-wrap">
                              <div className="min-w-0">
                                <p className="text-sm font-bold text-slate-800 truncate">{exp.poste}</p>
                                <p className="text-xs font-semibold text-[hsl(134,35%,45%)] mt-0.5">{exp.entreprise}</p>
                              </div>
                              <span className="text-[10px] font-medium text-slate-400 shrink-0 whitespace-nowrap">
                                {fmtPeriod(exp.debut, exp.fin)}
                              </span>
                            </div>
                            {exp.description && (
                              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed line-clamp-3">
                                {exp.description}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Aucun contenu droite */}
                {!data.formations?.length && !data.experiences?.length && (
                  <div className="flex flex-col items-center justify-center py-16 gap-2">
                    <FileText className="w-10 h-10 text-slate-200" />
                    <p className="text-sm text-slate-400">Aucune formation ni expérience renseignée.</p>
                  </div>
                )}
              </div>
            </div>

            {/* ── Footer ── */}
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              <p className="text-xs text-slate-400">
                {data.cvFileName && (
                  <span className="inline-flex items-center gap-1">
                    <FileText className="w-3 h-3" /> {data.cvFileName}
                  </span>
                )}
              </p>
              <button
                onClick={onClose}
                className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-sm font-semibold transition"
              >
                Fermer
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
