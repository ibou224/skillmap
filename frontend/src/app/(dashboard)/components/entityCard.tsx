/**
 * @module _components/EntityCard
 * @description Carte entité générique réutilisable pour toutes les sections du dashboard.
 * Structure : header gradient vert + cercles décoratifs / body flex-col / footer actions.
 * Utilisable pour Professeurs, Cours, Compétences, Sessions, etc.
 *
 * @param title      - Titre principal (ex: nom du professeur)
 * @param subtitle   - Sous-titre optionnel (ex: matricule, code cours)
 * @param badge      - Badge haut-droite du header (label + className Tailwind)
 * @param avatar     - Initiales pour l'avatar circulaire
 * @param icon       - Icône Lucide (alternative aux initiales)
 * @param fields     - Champs affichés dans le body (icon + label + value)
 * @param tags       - Badges colorés (ex: départements, spécialités)
 * @param actions    - Boutons du footer (label + variant + onClick)
 * @param isArchived - Style grisé si true (header gris au lieu de vert)
 */

"use client";

import React from "react";
import type { LucideIcon } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CardBadge {
  label: string;
  className?: string; // classes Tailwind bg + text + border
}

export interface CardField {
  icon?: LucideIcon;
  label: string;
  value: React.ReactNode;
}

export interface CardTag {
  label: string;
  className?: string; // classes Tailwind bg + text + border
}

export type CardActionVariant =
  | "citeGreenLight"
  | "dangerFill"
  | "archiveLight"
  | "cancel"
  | "outline";

export interface CardAction {
  label: string;
  icon?: LucideIcon;
  variant: CardActionVariant;
  onClick: () => void;
  hidden?: boolean;
}

interface EntityCardProps {
  title: string;
  subtitle?: string;
  badge?: CardBadge;
  avatar?: string;
  icon?: LucideIcon;
  fields?: CardField[];
  tags?: CardTag[];
  actions?: CardAction[];
  isArchived?: boolean;
}

// ─── Map variant → classes Tailwind ──────────────────────────────────────────

const ACTION_CLASSES: Record<CardActionVariant, string> = {
  citeGreenLight:
    "flex-1 min-w-20 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl cursor-pointer border transition-all duration-200 bg-[hsl(134_35%_45%)]/10 text-[hsl(134_35%_45%)] border-[hsl(134_35%_45%)]/20 hover:bg-[hsl(134_35%_45%)] hover:text-white",
  dangerFill:
    "flex-1 min-w-20 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl cursor-pointer border transition-all duration-200 bg-red-50 text-red-500 border-red-100 hover:bg-red-500 hover:text-white",
  archiveLight:
    "flex-1 min-w-20 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl cursor-pointer border transition-all duration-200 bg-orange-50 text-orange-500 border-orange-100 hover:bg-orange-500 hover:text-white",
  cancel:
    "flex-1 min-w-20 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl cursor-pointer border transition-all duration-200 bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200 hover:text-gray-800",
  outline:
    "flex-1 min-w-20 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl cursor-pointer border transition-all duration-200 bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:text-gray-900",
};

// ─── Composant ────────────────────────────────────────────────────────────────

export default function EntityCard({
  title,
  subtitle,
  badge,
  avatar,
  icon: Icon,
  fields = [],
  tags = [],
  actions = [],
  isArchived = false,
}: EntityCardProps) {
  const visibleActions = actions.filter((a) => !a.hidden);

  return (
    <div
      className={`group flex flex-col h-full bg-white rounded-2xl transition-all duration-300 overflow-hidden border ${
        isArchived
          ? "border-gray-200 opacity-90"
          : "border-gray-100 hover:border-gray-200 shadow-sm hover:shadow-xl"
      }`}
    >
      {/* ── HEADER ── */}
      <div
        className={`relative p-5 overflow-hidden ${
          isArchived
            ? "bg-gradient-to-br from-gray-400 to-gray-600"
            : "bg-gradient-to-br from-[hsl(134_35%_45%)] to-[#135d55]"
        }`}
      >
        {/* Cercles décoratifs */}
        <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/10 pointer-events-none" />
        <div className="absolute -bottom-4 -left-4 w-20 h-20 rounded-full bg-white/10 pointer-events-none" />
        <div className="absolute top-1/2 right-6 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 pointer-events-none" />

        {/* Ligne 1 : subtitle + badge */}
        <div className="relative z-10 flex items-center justify-between gap-2 mb-3">
          {subtitle ? (
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-white/10 text-white/70 border border-white/15 truncate max-w-[130px]">
              {subtitle}
            </span>
          ) : (
            <span />
          )}

          {badge && (
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border shrink-0 ${
                badge.className ??
                "bg-white/15 text-white border-white/25"
              }`}
            >
              {badge.label}
            </span>
          )}
        </div>

        {/* Ligne 2 : avatar / icône + titre */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border bg-white/20 border-white/30 group-hover:scale-105 transition-transform">
            {avatar ? (
              <span className="text-sm font-black text-white">{avatar}</span>
            ) : Icon ? (
              <Icon className="w-4 h-4 text-white" />
            ) : null}
          </div>
          <h3
            className="font-black text-white text-sm leading-tight line-clamp-2"
            title={title}
          >
            {title}
          </h3>
        </div>
      </div>

      {/* ── BODY ── */}
      <div className="p-4 flex-1 flex flex-col gap-4">
        {/* Champs */}
        {fields.length > 0 && (
          <div className="space-y-2">
            {fields.map((field, i) => {
              const FieldIcon = field.icon;
              return (
                <div key={i} className="flex items-start gap-2">
                  {FieldIcon && (
                    <FieldIcon className="w-3.5 h-3.5 text-gray-400 mt-0.5 shrink-0" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      {field.label}
                    </p>
                    <div className="text-sm font-medium text-gray-800 truncate">
                      {field.value}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Tags */}
        {tags.length > 0 && (
          <div className="mt-auto">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
              Tags
            </p>
            <div className="flex flex-wrap gap-1">
              {tags.map((tag, i) => (
                <span
                  key={i}
                  className={`px-2 py-0.5 text-[10px] font-semibold rounded-full border ${
                    tag.className ?? "bg-gray-50 text-gray-600 border-gray-200"
                  }`}
                >
                  {tag.label}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── FOOTER ACTIONS ── */}
      {visibleActions.length > 0 && (
        <div className="px-4 py-3 border-t border-gray-100 bg-gray-50/40 flex flex-wrap gap-2">
          {visibleActions.map((action) => {
            const ActionIcon = action.icon;
            return (
              <button
                key={action.label}
                onClick={action.onClick}
                className={ACTION_CLASSES[action.variant]}
              >
                {ActionIcon && <ActionIcon className="w-3.5 h-3.5" />}
                {action.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}