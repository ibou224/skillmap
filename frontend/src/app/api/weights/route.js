import { NextResponse } from "next/server";
import prisma from "@/lib/prisma.js";
import { requireRole } from "@/lib/permission.js";
import {normalizeWeights} from "@/lib/formatData";

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