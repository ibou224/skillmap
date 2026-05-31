/**
 * @module components/cv/CvModalComponents
 * @description Briques d'affichage réutilisables de la modale CV : formatage de
 * période, titre de section, barre de niveau et point de timeline.
 */

import { NIVEAU_BARS, NIVEAU_LABEL } from "../../constants/cvConstantes";


/**
 * Formate une période « AAAA/MM — AAAA/MM » (ou « Présent » si fin absente).
 * @param {string} debut - Date de début (ISO).
 * @param {string} [fin] - Date de fin (ISO) ; « Présent » si absente.
 * @returns {string} La période formatée.
 */
export function fmtPeriod(debut, fin) {
  if (!debut) return "";
  const d = debut.slice(0, 7).replace("-", "/");
  const f = fin ? fin.slice(0, 7).replace("-", "/") : "Présent";
  return `${d} — ${f}`;
}


/**
 * Titre de section avec icône et soulignement.
 * @param {Object} props
 * @param {React.ComponentType} props.icon - Composant icône (Lucide).
 * @param {React.ReactNode} props.children - Libellé de la section.
 * @param {string} [props.color] - Classe de couleur du titre.
 * @returns {JSX.Element} Le titre de section.
 */
export function SectionTitle({ icon: Icon, children, color = "text-[hsl(134,35%,45%)]" }) {
  return (
    <div className={`flex items-center gap-2 mb-3 pb-2 border-b border-slate-100 ${color}`}>
      <Icon className="w-4 h-4 shrink-0" />
      <h3 className="text-xs font-black uppercase tracking-widest">{children}</h3>
    </div>
  );
}

/**
 * Barre de niveau de compétence (5 segments remplis selon le niveau).
 * @param {Object} props
 * @param {string} props.niveau - Niveau de compétence (clé de NIVEAU_BARS).
 * @returns {JSX.Element} La barre de niveau.
 */
export function NiveauBar({ niveau }) {
  const filled = NIVEAU_BARS[niveau] ?? 2;
  return (
    <div className="flex gap-0.5" title={NIVEAU_LABEL[niveau] ?? niveau}>
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className={`h-1.5 w-4 rounded-full transition-all ${
            i < filled ? "bg-[hsl(134,35%,45%)]" : "bg-slate-200"
          }`}
        />
      ))}
    </div>
  );
}

/**
 * Point de jalon pour une timeline verticale.
 * @returns {JSX.Element} Le point de timeline.
 */
export function TimelineDot() {
  return (
    <div className="relative flex flex-col items-center">
      <div className="w-3 h-3 rounded-full bg-[hsl(134,35%,45%)] border-2 border-white shadow-sm shrink-0 mt-0.5" />
      <div className="w-px flex-1 bg-slate-200 mt-1" />
    </div>
  );
}