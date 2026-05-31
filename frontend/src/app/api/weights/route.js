/**
 * @module app/api/weights/route
 * @description Route API listant les configurations de pondération de toutes les
 * sessions (normalisées via formatData).
 */

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma.js";
import { requireRole } from "@/lib/permission.js";
import {normalizeWeights} from "@/lib/formatData";

/**
 * Récupère toutes les configurations de pondération avec les informations de session.
 *
 * Réservé aux administrateurs et RH. Les résultats sont triés par date de début
 * de session décroissante (session la plus récente en premier) et normalisés
 * via `normalizeWeights` avant d'être retournés.
 *
 * @route GET /api/weights
 *
 * @param {Request} request - La requête HTTP.
 *
 * @returns {200} Liste des configurations de pondération avec leurs sessions.
 * @returns {401|403} Non connecté ou rôle insuffisant.
 * @returns {500} Erreur interne du serveur.
 */
export async function GET(request) {
  const { session, error } = await requireRole("ADMIN", "RH");
  if (error) return error;

  try {
    const weights = await prisma.weightsConfig.findMany({
      include: {
        session: {
          select: {
            id: true,
            nom: true,
            annee: true,
            periode: true,
            statut: true,
            dateDebut: true,
            dateFin: true,
          },
        },
      },
      orderBy: {
        session: {
          dateDebut: "desc",
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: normalizeWeights(weights),
    });

  } catch (err) {
    console.error("Erreur lors de la récupération des pondérations :", err);
    return NextResponse.json(
      { 
        success: false, 
        message: "Erreur lors de la récupération des pondérations." 
      },
      { status: 500 }
    );
  }
}