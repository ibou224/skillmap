import { NextResponse } from "next/server";
import prisma from "@/lib/prisma.js";
import { isValidRole } from "@/lib/validation.js";
import { requireRole } from "@/lib/permission.js";

export async function PUT(request, { params }) {
  const { error } = await requireRole("ADMIN");
  if (error) return error;

  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { success: false, message: "L'identifiant de l'utilisateur est requis." },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { estActif, role } = body;

    if (estActif === undefined || role === undefined) {
      return NextResponse.json(
        { success: false, message: "Les champs 'estActif' et 'role' sont obligatoires." },
        { status: 400 }
      );
    }

    if (!isValidRole(role)) {
      return NextResponse.json(
        { success: false, message: "Rôle invalide. Les rôles autorisés sont : ADMIN, RH, PROFESSEUR." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Utilisateur introuvable." },
        { status: 404 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        isActive: Boolean(estActif),
        role: String(role).toUpperCase().trim(),
        ...(estActif && { loginAttempts: 0 }),
      },
      select: { id: true, email: true, nom: true, prenom: true, role: true, isActive: true },
    });

    return NextResponse.json({
      success: true,
      message: "Le profil de l'utilisateur a été mis à jour avec succès.",
      user: updatedUser,
    });

  } catch (err) {
    console.error("Erreur critique PUT /api/admin/users/[id] :", err);
    return NextResponse.json(
      { success: false, message: "Une erreur interne est survenue lors de la mise à jour." },
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
        { success: false, message: "L'identifiant de l'utilisateur est requis." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Utilisateur introuvable." },
        { status: 404 }
      );
    }

    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: `Le compte de ${user.prenom} ${user.nom} a été désactivé.`,
    });

  } catch (err) {
    console.error("Erreur critique DELETE /api/admin/users/[id] :", err);
    return NextResponse.json(
      { success: false, message: "Une erreur interne est survenue." },
      { status: 500 }
    );
  }
}
