/**
 * @module app/api/departements/route
 * @description Route API de récupération de la liste des départements.
 */

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma.js";
import { requireRole } from "@/lib/permission.js";

/**
 * Route GET /api/departements — liste les départements (id, code, nom) triés par nom.
 *
 * @route GET /api/departements
 * @access ADMIN, RH
 * @returns {NextResponse} 200 avec la liste, 401/403 si non autorisé, 500 sur erreur serveur.
 */
export async function GET() {
  const { error } = await requireRole("ADMIN", "RH");
  if (error) return error;

  try {
    const departements = await prisma.departement.findMany({
      select: { id: true, code: true, nom: true },
      orderBy: { nom: "asc" },
    });
    return NextResponse.json({ success: true, data: departements }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ success: false, message: "Erreur serveur." }, { status: 500 });
  }
}
