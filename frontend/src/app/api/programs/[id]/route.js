import { NextResponse } from "next/server";
import prisma from "@/lib/prisma.js";
import { requireRole, getIp } from "@/lib/permission.js";
import { isValidString } from "@/lib/validation";

/**
 * @route PUT /api/programs/[id]
 * @access ADMIN
 */
export async function PUT(request, { params }) {
  const { session, error } = await requireRole("ADMIN");
  if (error) return error;

  const { id } = await params;

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
    if(!departementId) {
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

    // Vérifier unicité du code (sauf pour ce programme)
    const uniqueCode = await prisma.program.findFirst({
      where: { code: code.trim().toUpperCase(), NOT: { id } },
    });
    if (uniqueCode) {
      return NextResponse.json(
        {
          success: false,
          message: `Le code "${code.trim().toUpperCase()}" est déjà utilisé par un autre programme.`,
        },
        { status: 409 },
      );
    }

    const program = await prisma.program.update({
      where: { id },
      data: {
        code: code.trim().toUpperCase(),
        nom: nom.trim(),
        nbEtapes: etapes,
        departementId: departementId,
      },
      include: { departement: { select: { nom: true, code: true } } },
    });

    await prisma.auditLog.create({
      data: {
        action: "UPDATE",
        entityType: "PROGRAM",
        entityId: program.id,
        userId: session.user.id,
        metadata: {
          code: program.code,
          nom: program.nom,
          message: `Mise à jour du programme ${program.nom}`,
        },
        ipAddress: getIp(request),
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: `Programme "${program.nom}" modifié avec succès.`,
        data: program,
      },
      { status: 200 },
    );
  } catch (err) {
    if (err.code === "P2025") {
      return NextResponse.json(
        { success: false, message: "Programme introuvable." },
        { status: 404 },
      );
    }
    if (err.code === "P2002") {
      return NextResponse.json(
        { success: false, message: "Ce code est déjà utilisé." },
        { status: 409 },
      );
    }
    return NextResponse.json(
      { success: false, message: "Erreur serveur." },
      { status: 500 },
    );
  }
}

/**
 * @route DELETE /api/programs/[id]
 * @access ADMIN
 */
export async function DELETE(request, { params }) {
  const { session, error } = await requireRole("ADMIN");
  if (error) return error;

  const { id } = await params;

  try {
    const program = await prisma.program.findUnique({ where: { id } });
    if (!program) {
      return NextResponse.json(
        { success: false, message: "Programme introuvable." },
        { status: 404 },
      );
    }

    await prisma.program.delete({ where: { id } });

    await prisma.auditLog.create({
      data: {
        action: "DELETE",
        entityType: "PROGRAM",
        entityId: id,
        userId: session.user.id,
        metadata: {
          code: program.code,
          nom: program.nom,
          message: `Suppression du programme ${program.nom}`,
        },
        ipAddress: getIp(request),
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: `Programme "${program.nom}" supprimé avec succès.`,
      },
      { status: 200 },
    );
  } catch (err) {
    if (err.code === "P2025") {
      return NextResponse.json(
        { success: false, message: "Programme introuvable." },
        { status: 404 },
      );
    }
    return NextResponse.json(
      { success: false, message: "Erreur serveur." },
      { status: 500 },
    );
  }
}
