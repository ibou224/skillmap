import { NextResponse } from "next/server";
import prisma from "@/lib/prisma.js";
import { isValidString } from "@/lib/validation.js";
import { requireRole, getIp } from "@/lib/permission.js";

/**
 * @module app/api/skills/route
 * @description Routes API du référentiel de compétences : listing (GET) et création (POST).
 */

/**
 * Liste toutes les compétences (id, nom, catégorie, description) triées par nom.
 * @route GET /api/skills
 * @access ADMIN, RH, PROFESSEUR
 * @returns {NextResponse} 200 avec les compétences, 401/403 si non autorisé, 500 sur erreur.
 */
export async function GET() {
  const { session, error } = await requireRole("ADMIN", "RH", "PROFESSEUR");
  if (error) return error;
  try {
    const skills = await prisma.skill.findMany({
      orderBy: { nom: "asc" },
      select: { id: true, nom: true, categorie: true, description: true },
    });
    return NextResponse.json({ success: true, data: skills }, { status: 200 });
  } catch (error) {
    console.error("[GET_SKILLS_ERROR]:", error);
    return NextResponse.json({ success: false, error: "Erreur interne." }, { status: 500 });
  }
}

/**
 * Crée une nouvelle compétence.
 * @route POST /api/skills
 * @access ADMIN
 * @param {Request} request - Corps JSON `{ nom, categorie, description? }`.
 * @returns {NextResponse} 201 si créée, 400 si invalide, 401/403 si non autorisé, 500 sur erreur.
 */
export async function POST(request) {
  const { session, error } = await requireRole("ADMIN", "RH", "PROFESSEUR");
  if (error) return error;

  try {
    const { nom, categorie, description } = await request.json();

    if (!isValidString(nom).valid) {
      return NextResponse.json({ success: false, error: "Le nom est requis." }, { status: 400 });
    }
    if (!isValidString(categorie).valid) {
      return NextResponse.json({ success: false, error: "La catégorie est requise." }, { status: 400 });
    }

    const skill = await prisma.skill.create({
      data: { nom: nom.trim(), categorie: categorie.trim(), description: description?.trim() || null },
    });

    await prisma.auditLog.create({
      data: {
        action: "CREATE",
        entityType: "COMPETENCE",
        entityId: skill.id,
        userId: session.user.id,
        metadata: { email: session.user.email, role: session.user.role, message: "Compétence créée", nom: skill.nom },
        ipAddress: getIp(request),
      },
    });

    return NextResponse.json({ success: true, data: skill }, { status: 201 });
  } catch (err) {
    if (err.code === "P2002") {
      return NextResponse.json({ success: false, error: "Ce nom de compétence existe déjà." }, { status: 409 });
    }
    console.error("[POST_SKILL_ERROR]:", err);
    return NextResponse.json({ success: false, error: "Erreur interne." }, { status: 500 });
  }
}