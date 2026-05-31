import { NextResponse } from "next/server";
import prisma from "@/lib/prisma.js";
import { isValidString } from "@/lib/validation.js";
import { requireRole, getIp } from "@/lib/permission.js";

/**
 * @module app/api/skills/[id]/route
 * @description Routes API d'une compétence ciblée par son id : modification (PUT)
 * et suppression (DELETE).
 */

/**
 * Met à jour une compétence.
 * @route PUT /api/skills/[id]
 * @access ADMIN
 * @param {Request} request - Corps JSON `{ nom, categorie, description? }`.
 * @param {{ params: { id: string } }} context - Identifiant de la compétence.
 * @returns {NextResponse} 200 si modifiée, 400 si invalide, 404 si introuvable, 401/403 si non autorisé, 500 sur erreur.
 */
export async function PUT(request, { params }) {
  const { session, error } = await requireRole("ADMIN");
  if (error) return error;

  try {
    const { id } = await params;
    const { nom, categorie, description } = await request.json();

    if (!isValidString(nom).valid) {
      return NextResponse.json({ success: false, error: "Le nom est requis." }, { status: 400 });
    }
    if (!isValidString(categorie).valid) {
      return NextResponse.json({ success: false, error: "La catégorie est requise." }, { status: 400 });
    }

    const skill = await prisma.skill.update({
      where: { id },
      data: { nom: nom.trim(), categorie: categorie.trim(), description: description?.trim() || null },
    });

    await prisma.auditLog.create({
      data: {
        action: "UPDATE",
        entityType: "COMPETENCE",
        entityId: id,
        userId: session.user.id,
        metadata: { email: session.user.email, role: session.user.role, message: "Compétence mise à jour", nom: skill.nom },
        ipAddress: getIp(request),
      },
    });

    return NextResponse.json({ success: true, data: skill });
  } catch (err) {
    if (err.code === "P2002") {
      return NextResponse.json({ success: false, error: "Ce nom de compétence existe déjà." }, { status: 409 });
    }
    if (err.code === "P2025") {
      return NextResponse.json({ success: false, error: "Compétence introuvable." }, { status: 404 });
    }
    console.error("[PUT_SKILL_ERROR]:", err);
    return NextResponse.json({ success: false, error: "Erreur interne." }, { status: 500 });
  }
}

/**
 * Supprime une compétence.
 * @route DELETE /api/skills/[id]
 * @access ADMIN
 * @param {Request} request - Requête HTTP.
 * @param {{ params: { id: string } }} context - Identifiant de la compétence.
 * @returns {NextResponse} 200 si supprimée, 404 si introuvable, 401/403 si non autorisé, 500 sur erreur.
 */
export async function DELETE(request, { params }) {
  const { session, error } = await requireRole("ADMIN");
  if (error) return error;

  try {
    const { id } = await params;
    const existing = await prisma.skill.findUnique({ where: { id }, select: { nom: true } });
    await prisma.skill.delete({ where: { id } });

    await prisma.auditLog.create({
      data: {
        action: "DELETE",
        entityType: "COMPETENCE",
        entityId: id,
        userId: session.user.id,
        metadata: { email: session.user.email, role: session.user.role, message: "Compétence supprimée", nom: existing?.nom },
        ipAddress: getIp(request),
      },
    });

    return NextResponse.json({ success: true, message: "Compétence supprimée." });
  } catch (err) {
    if (err.code === "P2025") {
      return NextResponse.json({ success: false, error: "Compétence introuvable." }, { status: 404 });
    }
    if (err.code === "P2003") {
      return NextResponse.json(
        { success: false, error: "Cette compétence est liée à des cours ou des profils et ne peut pas être supprimée." },
        { status: 409 }
      );
    }
    console.error("[DELETE_SKILL_ERROR]:", err);
    return NextResponse.json({ success: false, error: "Erreur interne." }, { status: 500 });
  }
}
