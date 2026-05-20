/**
 * @module _components/EntityTable
 * @description Tableau générique réutilisable pour toutes les entités du dashboard.
 * Gère les colonnes dynamiques, les actions par ligne, les badges et les états vides.
 *
 * @template T - Type de l'entité affichée
 *
 * @param columns   - Définition des colonnes (key, label, render optionnel)
 * @param data      - Tableau de données à afficher
 * @param actions   - Actions par ligne (label, icon, variant, onClick)
 * @param keyField  - Champ utilisé comme clé React (défaut: "id")
 * @param emptyText - Texte affiché si data est vide
 */

"use client";

import React from "react";
import { LucideIcon } from "lucide-react";
import { Button } from "../components/ui/button";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ColumnVariant = "text" | "badge" | "custom";

export interface Column<T> {
  key: keyof T | string;
  label: string;
  variant?: ColumnVariant;
  render?: (row: T) => React.ReactNode;
  badgeColor?: (row: T) => string; // classes Tailwind pour le badge
  align?: "left" | "right" | "center";
}

export interface TableAction<T> {
  label: string;
  icon: LucideIcon;
  variant: "citeGreenLight" | "dangerFill" | "archiveLight" | "outline";
  onClick: (row: T) => void;
  hidden?: (row: T) => boolean;
}

interface EntityTableProps<T extends Record<string, unknown>> {
  columns: Column<T>[];
  data: T[];
  actions?: TableAction<T>[];
  keyField?: keyof T;
  emptyText?: string;
}

// ─── Map variant → classes Tailwind ──────────────────────────────────────────

const ACTION_CLASSES: Record<TableAction<unknown>["variant"], string> = {
  citeGreenLight:
    "cursor-pointer rounded-xl bg-[hsl(134_35%_45%)]/10 text-[hsl(134_35%_45%)] border border-[hsl(134_35%_45%)]/20 font-semibold hover:bg-[hsl(134_35%_45%)] hover:text-white transition-all duration-200",
  dangerFill:
    "cursor-pointer rounded-xl bg-red-50 text-red-500 border border-red-100 font-semibold hover:bg-red-500 hover:text-white transition-all duration-200",
  archiveLight:
    "cursor-pointer rounded-xl bg-orange-50 text-orange-500 border border-orange-100 font-semibold hover:bg-orange-500 hover:text-white transition-all duration-200",
  outline:
    "cursor-pointer rounded-xl border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
};

// ─── Composant ────────────────────────────────────────────────────────────────

export default function EntityTable<T extends Record<string, unknown>>({
  columns,
  data,
  actions = [],
  keyField = "id" as keyof T,
  emptyText = "Aucune donnée disponible.",
}: EntityTableProps<T>) {
  if (data.length === 0) {
    return (
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 p-12 text-center text-slate-400 text-sm">
        {emptyText}
      </div>
    );
  }

  const getCellValue = (row: T, col: Column<T>): React.ReactNode => {
    if (col.render) return col.render(row);

    const raw = row[col.key as keyof T];
    const text = raw != null ? String(raw) : "—";

    if (col.variant === "badge") {
      const colorClasses = col.badgeColor?.(row) ?? "bg-gray-100 text-gray-700 border-gray-200";
      return (
        <span className={`px-2 py-1 rounded-lg text-[10px] font-bold border ${colorClasses}`}>
          {text}
        </span>
      );
    }

    return <span className="text-sm text-slate-700">{text}</span>;
  };

  const alignClass = (align?: Column<T>["align"]) => {
    if (align === "right") return "text-right";
    if (align === "center") return "text-center";
    return "text-left";
  };

  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          {/* ── Head ── */}
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100">
              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  className={`px-6 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400 ${alignClass(col.align)}`}
                >
                  {col.label}
                </th>
              ))}
              {actions.length > 0 && (
                <th className="px-6 py-5 text-right text-[11px] font-black uppercase tracking-widest text-slate-400">
                  Actions
                </th>
              )}
            </tr>
          </thead>

          {/* ── Body ── */}
          <tbody className="divide-y divide-slate-50">
            {data.map((row) => (
              <tr
                key={String(row[keyField])}
                className="group hover:bg-slate-50/80 transition-colors duration-200"
              >
                {columns.map((col) => (
                  <td
                    key={String(col.key)}
                    className={`px-6 py-4 ${alignClass(col.align)}`}
                  >
                    {getCellValue(row, col)}
                  </td>
                ))}

                {actions.length > 0 && (
                  <td className="px-6 py-4 text-right">
                    <div className="inline-flex gap-1.5">
                      {actions
                        .filter((a) => !a.hidden?.(row))
                        .map((action) => {
                          const ActionIcon = action.icon;
                          return (
                            <button
                              key={action.label}
                              onClick={() => action.onClick(row)}
                              title={action.label}
                              className={`h-7 w-7 p-0 flex items-center justify-center text-xs ${ACTION_CLASSES[action.variant]}`}
                            >
                              <ActionIcon size={14} />
                            </button>
                          );
                        })}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}