/**
 * @module app/api/notifications/route
 * @description Routes API des notifications de l'utilisateur connecté :
 * liste des non lues (GET), marquage de toutes comme lues (PATCH) et marquage
 * d'une notification précise (PUT).
 */

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireRole } from "@/lib/permission";

/**
 * Route GET /api/notifications — retourne les 20 dernières notifications non lues.
 * @access PROFESSEUR, RH, ADMIN
 * @returns {NextResponse} 200 avec les notifications, 401/403 si non autorisé, 500 sur erreur.
 */
export async function GET() {
  const { session, error } = await requireRole("PROFESSEUR", "RH", "ADMIN");
  if (error) return error;
  try {
    const data = await prisma.notification.findMany({
      where: { userId: session.user.id, isRead: false },
      orderBy: { createdAt: "desc" },
      take: 20,
    });
    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { success: false, error: "Erreur serveur" },
      { status: 500 },
    );
  }
}

/**
 * Route PATCH /api/notifications — marque toutes les notifications de l'utilisateur comme lues.
 * @access PROFESSEUR, RH, ADMIN
 * @returns {NextResponse} 200 si succès, 401/403 si non autorisé, 500 sur erreur.
 */
export async function PATCH() {
  const { session, error } = await requireRole("PROFESSEUR", "RH", "ADMIN");
  if (error) return error;
  try {
    await prisma.notification.updateMany({
      where: { userId: session.user.id, isRead: false },
      data: { isRead: true },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { success: false, error: "Erreur serveur" },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true });
}


/**
 * Route PUT /api/notifications — marque une notification précise comme lue.
 * @access PROFESSEUR, RH, ADMIN
 * @param {Request} request - Corps JSON `{ id }` de la notification.
 * @returns {NextResponse} 200 si succès, 404 si introuvable, 401/403 si non autorisé, 500 sur erreur.
 */
export async function PUT(request) {
  const { session, error } = await requireRole("PROFESSEUR", "RH", "ADMIN");
  if (error) return error;

  const { id } = await request.json();
  try {
    await prisma.notification.update({
      where: { id, userId: session.user.id },
      data: { isRead: true },
    });
  } catch (err) {
    if (err.code === "P2025") {
      return NextResponse.json(
        { success: false, error: "Notification introuvable." },
        { status: 404 },
      );
    }
    console.error(err);
    return NextResponse.json(
      { success: false, error: "Erreur serveur" },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true });
}

