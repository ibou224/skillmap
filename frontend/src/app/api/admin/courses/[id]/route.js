import { NextResponse } from "next/server";
import prisma from "@/lib/prisma.js";
import { isValidString } from "@/lib/validation.js";
import { requireRole } from "@/lib/permission.js";

export async function PUT(request, { params }) {
  const { error } = await requireRole("ADMIN");
  if (error) return error;

  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { success: false, message: "L'identifiant du cours est requis." },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { nom, code, programIds, etape } = body;

    if (nom !== undefined && !isValidString(nom)) {
      return NextResponse.json(
        { success: false, message: "Nom invalide (caractères spéciaux interdits)." },
        { status: 400 }
      );
    }

    const etapeNum = etape !== undefined ? Number(etape) : undefined;
    if (etapeNum !== undefined && (!Number.isInteger(etapeNum) || etapeNum < 1 || etapeNum > 6)) {
      return NextResponse.json(
        { success: false, message: "Étape invalide (entier de 1 à 6)." },
        { status: 400 }
      );
    }

    const course = await prisma.course.findUnique({ where: { id } });
    if (!course) {
      return NextResponse.json(
        { success: false, message: "Cours introuvable." },
        { status: 404 }
      );
    }

    const { isArchived } = body;

    const updatedCourse = await prisma.course.update({
      where: { id },
      data: {
        ...(nom && { nom: nom.trim() }),
        ...(code !== undefined && { code: code?.trim() || null }),
        ...(etapeNum !== undefined && { etape: etapeNum }),
        ...(isArchived !== undefined && { isArchived: Boolean(isArchived) }),
        ...(programIds && {
          programs: { set: programIds.map((pid) => ({ id: pid })) },
        }),
      },
      include: {
        programs: { select: { id: true, nom: true } },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Cours mis à jour avec succès.",
      data: updatedCourse,
    });
  } catch (err) {
    console.error("Erreur PUT /api/admin/courses/[id] :", err);
    return NextResponse.json(
      { success: false, message: "Erreur interne du serveur." },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  const { error } = await requireRole("ADMIN");
  if (error) return error;

  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { success: false, message: "L'identifiant du cours est requis." },
        { status: 400 }
      );
    }

    const course = await prisma.course.findUnique({ where: { id } });
    if (!course) {
      return NextResponse.json(
        { success: false, message: "Cours introuvable." },
        { status: 404 }
      );
    }

    await prisma.course.update({
      where: { id },
      data: { isArchived: true },
    });

    return NextResponse.json({
      success: true,
      message: `Le cours "${course.nom}" a été archivé.`,
    });
  } catch (err) {
    console.error("Erreur DELETE /api/admin/courses/[id] :", err);
    return NextResponse.json(
      { success: false, message: "Erreur interne du serveur." },
      { status: 500 }
    );
  }
}
