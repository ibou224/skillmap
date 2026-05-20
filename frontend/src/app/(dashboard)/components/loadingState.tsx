/**
 * @module _components/LoadingState
 * @description État de chargement générique avec spinner animé.
 * Utilisé dans toutes les sections pendant le fetch initial.
 *
 * @param message - Texte affiché sous le spinner (optionnel)
 * @param rows    - Nombre de lignes skeleton à afficher (mode "skeleton")
 * @param mode    - "spinner" (défaut) | "skeleton"
 */

import React from "react";
import { Loader2 } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface LoadingStateProps {
  message?: string;
  rows?: number;
  mode?: "spinner" | "skeleton";
}

// ─── Skeleton row ─────────────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 px-6 py-4 animate-pulse">
      <div className="w-10 h-10 rounded-2xl bg-gray-100 shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3 bg-gray-200 rounded w-2/3" />
        <div className="h-3 bg-gray-100 rounded w-1/2" />
      </div>
      <div className="h-3 bg-gray-100 rounded w-16" />
    </div>
  );
}

// ─── Composant ────────────────────────────────────────────────────────────────

export default function LoadingState({
  message = "Chargement...",
  rows = 3,
  mode = "spinner",
}: LoadingStateProps) {
  if (mode === "skeleton") {
    return (
      <div className="divide-y divide-gray-50">
        {Array.from({ length: rows }).map((_, i) => (
          <SkeletonRow key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4 text-[hsl(134_35%_45%)]">
      <Loader2 className="w-10 h-10 animate-spin" />
      <p className="text-sm font-medium text-slate-500">{message}</p>
    </div>
  );
}