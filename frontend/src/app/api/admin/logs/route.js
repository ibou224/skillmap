/**
 * @module app/api/admin/logs/route
 * @description Route API de consultation des logs d'audit (administration).
 */

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma.js";
import { requireRole } from "@/lib/permission.js";

/**
 * Retourne tous les logs d'audit.
 * Le filtrage et la pagination sont gérés côté client.
 *
 * @route GET /api/admin/logs
 * @access ADMIN
 * @param {Request} request - Requête HTTP ; paramètre query optionnel `limit`.
 * @returns {NextResponse} 200 avec les logs (+ utilisateur lié), 401/403 si non autorisé, 500 sur erreur.
 */
export async function GET(request) {
  const { error } = await requireRole("ADMIN");
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const limitParam = searchParams.get("limit");
  const take = limitParam ? parseInt(limitParam, 10) : undefined;

  try {
    const logs = await prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      ...(take ? { take } : {}),
      select: {
        id:         true,
        action:     true,
        entityType: true,
        entityId:   true,
        metadata:   true,
        ipAddress:  true,
        createdAt:  true,
        user: {
          select: {
            id:     true,
            nom:    true,
            prenom: true,
            email:  true,
            role:   true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, data: logs });
  } catch (err) {
    console.error("GET /api/admin/logs :", err);
    return NextResponse.json(
      { success: false, message: "Erreur serveur." },
      { status: 500 },
    );
  }
}
