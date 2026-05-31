"use client";

/**
 * @module components/ui/Banner
 * @description Bannière d'en-tête décorative avec titre et description.
 */

/**
 * Bannière d'en-tête (dégradé) avec titre et sous-titre.
 * @param {Object} props
 * @param {string} props.title - Titre principal.
 * @param {string} props.description - Texte descriptif secondaire.
 * @returns {JSX.Element} La bannière.
 */
export function Banner({ title, description }) {
  return (
    <div className="relative overflow-hidden rounded-3xl p-8 shadow-lg bg-linear-to-br from-[hsl(134,35%,45%)] to-[#135d55]">
      <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/10 pointer-events-none" />
      <h1 className="relative text-2xl sm:text-3xl font-black text-white">{title}</h1>
      <p className="relative text-white/70 text-sm mt-1">{description}</p>
    </div>
  );
}