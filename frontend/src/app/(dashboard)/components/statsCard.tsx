/**
 * @module _components/StatsCard
 * @description Carte statistique animée avec compteur count-up.
 * Réutilisable sur toutes les sections du dashboard (Professeur, RH, Admin).
 *
 * @param title       - Libellé de la statistique
 * @param value       - Valeur numérique ou texte
 * @param icon        - Icône Lucide
 * @param color       - Classe Tailwind pour la couleur de l'icône (ex: "text-blue-600")
 * @param bgColor     - Classe Tailwind pour le fond de l'icône (ex: "bg-blue-50")
 * @param description - Sous-texte descriptif
 * @param isLoading   - Affiche un skeleton si true
 */

"use client";

import React, { useEffect, useRef, useState } from "react";
import { LucideIcon } from "lucide-react";

// ─── Hook count-up ────────────────────────────────────────────────────────────

function useCountUp(target: number, isLoading: boolean, duration = 900): number {
  const [display, setDisplay] = useState(0);
  const rafRef = useRef<number | null>(null);
  const prevTarget = useRef<number | null>(null);

  useEffect(() => {
    if (isLoading || typeof target !== "number") return;
    if (prevTarget.current === target) return;
    prevTarget.current = target;

    const start = display;
    const delta = target - start;
    if (delta === 0) return;

    const startTime = performance.now();
    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(start + delta * ease));
      if (progress < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [target, isLoading]); // eslint-disable-line react-hooks/exhaustive-deps

  return display;
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  color?: string;
  bgColor?: string;
  description?: string;
  isLoading?: boolean;
}

// ─── Composant ────────────────────────────────────────────────────────────────

export default function StatsCard({
  title,
  value,
  icon: Icon,
  color = "text-blue-600",
  bgColor = "bg-blue-50",
  description,
  isLoading = false,
}: StatsCardProps) {
  const numericValue = typeof value === "number" ? value : NaN;
  const displayed = useCountUp(isNaN(numericValue) ? 0 : numericValue, isLoading);

  return (
    <div className="group bg-white rounded-[1.5rem] p-6 border border-gray-100/80 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_-15px_rgba(20,184,166,0.12)] hover:-translate-y-1 transition-all duration-300">
      <div className="flex items-start justify-between">
        {/* Texte */}
        <div className="space-y-4">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
            {title}
          </p>
          <div className="space-y-1">
            {isLoading ? (
              <div className="h-10 w-16 bg-gray-200 rounded-lg animate-pulse" />
            ) : (
              <p className="text-4xl font-black text-gray-900 tracking-tight tabular-nums">
                {typeof value === "number" ? displayed : value}
              </p>
            )}
            {description && (
              <p className="text-sm font-medium text-gray-500">{description}</p>
            )}
          </div>
        </div>

        {/* Icône */}
        <div
          className={`p-3.5 rounded-2xl ${bgColor} border border-white shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6`}
        >
          <Icon className={`w-6 h-6 stroke-[2px] ${color}`} />
        </div>
      </div>
    </div>
  );
}