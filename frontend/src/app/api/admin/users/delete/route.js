import { NextResponse } from "next/server";
import prisma from "@/lib/prisma.js";
import { requireRole, getIp } from "@/lib/permission.js";

export async function DELETE(request, { params }) {
  const { session, error } = await requireRole("ADMIN");
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

    const userDeleted = await prisma.user.update({
      where: { id },
      data: { isArchived: true },
    });

    const { passwordHash, ...safeUser } = userDeleted;

    await prisma.auditLog.create({
      data: {
        action: "UPDATE",
        entityType: "USER",
        entityId: id,
        userId: session.user.id,
        metadata: {
          email: session.user.email,
          role: session.user.role,
          message: "Compte utilisateur supprimé",
          cible: user.email,
        },
        ipAddress: getIp(request),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Utilisateur supprimé avec succès.",
      user: safeUser,
    });

  } catch (err) {
    console.error("Erreur lors de la suppression de l'utilisateur:", err);
    return NextResponse.json(
      { success: false, message: "Une erreur interne est survenue lors de la suppression." },
      { status: 500 }
    );
  }
}
