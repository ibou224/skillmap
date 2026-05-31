/**
 * @module app/api/admin/courses/[id]/route
 * @description Routes API d'administration d'un cours ciblé par son id :
 * modification (PUT) et archivage/suppression douce (DELETE).
 */

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma.js";
import { isValidString } from "@/lib/validation.js";
import { requireRole, getIp } from "@/lib/permission.js";

/**
 * Modifie un cours existant.
 *
 * Réservé aux administrateurs.
 *
 * @route PUT /api/admin/courses/[id]
 *
 * @param {Request} request - La requête HTTP avec le corps JSON.
 * @param {{ params: { id: string } }} context - L'identifiant du cours dans l'URL.
 *
 * @body {string}   [nom]        - Nouveau nom du cours (sans caractères spéciaux).
 * @body {string}   [code]       - Code du cours (ex: "INF101"). Vide pour effacer.
 * @body {number}   [etape]      - Étape du cours, entier entre 1 et 6.
 * @body {boolean}  [isArchived] - Passer à `true` pour archiver le cours.
 * @body {string[]} [programIds] - Liste des identifiants de programmes à associer.
 *
 * @returns {200} Le cours mis à jour avec ses programmes.
 * @returns {400} Identifiant manquant, nom ou étape invalide.
 * @returns {401|403} Non connecté ou non administrateur.
 * @returns {404} Cours introuvable.
 * @returns {500} Erreur interne du serveur.
 */
export async function PUT(request, { params }) {
  const { session, error } = await requireRole("ADMIN");
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

    if (nom !== undefined && !isValidString(nom).valid) {
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

    await prisma.auditLog.create({
      data: {
        action: "UPDATE",
        entityType: "COURS",
        entityId: id,
        userId: session.user.id,
        metadata: {
          email: session.user.email,
          role: session.user.role,
          message: "Cours mis à jour",
          nom: updatedCourse.nom,
          isArchived: updatedCourse.isArchived,
        },
        ipAddress: getIp(request),
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

/**
 * Archive un cours (suppression douce).
 *
 * Réservé aux administrateurs. Le cours n'est pas effacé de la base de données,
 * il est simplement marqué comme archivé (`isArchived: true`).
 *
 * @route DELETE /api/admin/courses/[id]
 *
 * @param {Request} request - La requête HTTP.
 * @param {{ params: { id: string } }} context - L'identifiant du cours dans l'URL.
 *
 * @returns {200} Confirmation que le cours a été archivé.
 * @returns {400} Identifiant manquant.
 * @returns {401|403} Non connecté ou non administrateur.
 * @returns {404} Cours introuvable.
 * @returns {500} Erreur interne du serveur.
 */
export async function DELETE(request, { params }) {
  const { session, error } = await requireRole("ADMIN");
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

    await prisma.auditLog.create({
      data: {
        action: "DELETE",
        entityType: "COURS",
        entityId: id,
        userId: session.user.id,
        metadata: {
          email: session.user.email,
          role: session.user.role,
          message: "Cours archivé",
          nom: course.nom,
        },
        ipAddress: getIp(request),
      },
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
