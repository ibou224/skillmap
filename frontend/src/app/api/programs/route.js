/**
 * @module app/api/programes/route
 * @description Route API pour récupérer la liste des programmes.
 */

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma.js";
import { requireRole, getIp } from "@/lib/permission.js";
import { isValidString } from "@/lib/validation";

/**
 * Route GET /api/programmes
 *
 * Récupère la liste de tous les programmes d'études actifs avec leurs départements associés.
 *
 * Processus :
 * 1. Requêter la table Programme en filtrant uniquement les éléments actifs
 * 2. Inclure les données du département avec une sélection stricte (Data Minimization)
 * 3. Trier les résultats par ordre alphabétique pour l'interface utilisateur
 * 4. Retourner un objet de réponse standardisé avec le nombre d'éléments (count)
 *
 * @returns {NextResponse} Réponse JSON avec la liste des programmes
 *
 * Codes de réponse :
 * - 200 : Succès de la récupération
 * - 500 : Erreur serveur lors de la requête à la base de données
 */
export async function GET(request) {
  const { session, error } = await requireRole("ADMIN", "RH", "PROFESSEUR");
  if (error) return error;
  try {
    const programmes = await prisma.program.findMany({
      include: {
        departement: {
          select: {
            nom: true,
            code: true,
          },
        },
      },
      orderBy: {
        nom: "asc",
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: programmes,
        count: programmes.length,
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Erreur lors de la récupération des programmes",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    );
  }
}

/**
 * @route POST /api/programs
 * @access ADMIN
 */
export async function POST(request) {
  const { session, error } = await requireRole("ADMIN");
  if (error) return error;

  try {
    const { code, nom, nbEtapes, departementId } = await request.json();
    if (!isValidString(code).valid || !isValidString(nom).valid) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Code, nom et nombre d'étapes sont requis et doivent être des chaînes de caractères valides.",
        },
        { status: 400 },
      );
    }
    if (!departementId) {
      return NextResponse.json(
        {
          success: false,
          message: "Le département est requis.",
        },
        { status: 400 },
      );
    }

    const etapes = Number(nbEtapes);
    if (!Number.isInteger(etapes) || etapes < 1) {
      return NextResponse.json(
        {
          success: false,
          message: "Le nombre d'étapes doit être un entier supérieur à 0.",
        },
        { status: 400 },
      );
    }

    const existing = await prisma.program.findUnique({
      where: { code: code.trim().toUpperCase() },
    });
    if (existing) {
      return NextResponse.json(
        {
          success: false,
          message: `Un programme avec le code "${code.trim().toUpperCase()}" existe déjà.`,
        },
        { status: 409 },
      );
    }

    const program = await prisma.program.create({
      data: {
        code: code.trim().toUpperCase(),
        nom: nom.trim(),
        nbEtapes: etapes,
        departementId: departementId || null,
      },
      include: { departement: { select: { nom: true, code: true } } },
    });

    await prisma.auditLog.create({
      data: {
        action: "CREATE",
        entityType: "PROGRAM",
        entityId: program.id,
        userId: session.user.id,
        metadata: {
          code: program.code,
          nom: program.nom,
          message: "Nouveau programme créé",
        },
        ipAddress: getIp(request),
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: `Programme "${program.nom}" créé avec succès.`,
        data: program,
      },
      { status: 201 },
    );
  } catch (err) {
    if (err.code === "P2002") {
      return NextResponse.json(
        { success: false, message: "Ce code de programme est déjà utilisé." },
        { status: 409 },
      );
    }
    return NextResponse.json(
      { success: false, message: "Erreur serveur." },
      { status: 500 },
    );
  }
}
