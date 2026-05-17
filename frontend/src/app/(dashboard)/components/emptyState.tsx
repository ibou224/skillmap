/**
 * @module _components/EmptyState
 * @description État vide générique — affiché quand une liste ne contient aucun élément.
 * Supporte deux variantes : "no-data" (aucune donnée) et "no-results" (filtres actifs).
 *
 * @param icon        - Icône Lucide centrée
 * @param title       - Titre principal
 * @param description - Sous-texte explicatif
 * @param action      - Bouton d'action optionnel (label + onClick)
 */

import React from "react";
import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

// ─── Types ────────────────────────────────────────────────────────────────────

interface EmptyStateAction {
  label: string;
  onClick: () => void;
  variant?: "citeGreen" | "outline";
  icon?: LucideIcon;
}

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: EmptyStateAction;
}

// ─── Composant ────────────────────────────────────────────────────────────────

export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  const ActionIcon = action?.icon;

  return (
    <div className="flex flex-col items-center justify-center py-24 gap-3 text-slate-400">
      <Icon className="w-12 h-12 opacity-30" />

      <p className="font-medium text-slate-500">{title}</p>

      {description && (
        <p className="text-sm text-slate-400 text-center max-w-xs">
          {description}
        </p>
      )}

      {action && (
        <Button
          variant={action.variant === "citeGreen" ? "default" : "outline"}
          className={
            action.variant === "citeGreen"
              ? "mt-2 cursor-pointer rounded-xl bg-[hsl(134_35%_45%)] text-white font-bold hover:bg-[hsl(134_35%_35%)] transition-colors gap-1.5 px-5 py-2.5"
              : "mt-2 cursor-pointer rounded-xl border border-input shadow-sm hover:bg-accent gap-1.5 px-5 py-2.5"
          }
          onClick={action.onClick}
        >
          {ActionIcon && <ActionIcon className="w-4 h-4" />}
          {action.label}
        </Button>
      )}
    </div>
  );
}