/**
 * @module components/layout/Footer
 * @description Pied de page affiche sur les ecrans d'authentification.
 */

"use client";

import React from "react";

/**
 * Affiche le pied de page des pages de connexion.
 *
 * @returns {JSX.Element} Pied de page d'authentification.
 */
export default function Footer() {
  return (
    <footer className="mt-auto">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex flex-col items-center justify-center gap-1 text-center">
          <span className="text-sm font-medium text-[#36534e]">
            (c) 2026 College La Cite. Tous droits reserves.
          </span>
          <p className="text-xs text-[#647872]">
            SkillMap - Gestion des CV, competences et affectations
          </p>
        </div>
      </div>
    </footer>
  );
}
