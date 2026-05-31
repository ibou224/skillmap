/**
 * @module app/api/courses/add/route
 * @description Route API pour créer un nouveau cours.
 */

import { NextResponse } from 'next/server';
import prisma from "@/lib/prisma.js";
import { isValidString } from '@/lib/validation';
import { requireRole, getIp } from '@/lib/permission.js';

/**
 * Gère la route POST /api/courses/add — crée un nouveau cours et l'associe à un ou plusieurs programmes.
 *
 * @param {Request} request - La requête HTTP entrante.
 * @param {string} request.body.nom - Nom du cours.
 * @param {string} [request.body.code] - Code unique du cours (optionnel).
 * @param {string[]} request.body.programIds - Liste d'identifiants de programmes (au moins un requis).
 * @param {number} request.body.etape - Étape du cours (entier de 1 à 6).
 * @returns {Promise<NextResponse>} Réponse JSON avec le cours créé.
 */
export async function POST(request) {
  const { session, error } = await requireRole("ADMIN", "RH");
  if (error) return error;

  try {
    const body = await request.json();
    const { nom, code, programIds, etape, courseSkills } = body;

    const nomCheck = isValidString(nom ?? '');
    if (!nomCheck.valid) {
      return NextResponse.json({ success: false, message: nomCheck.message }, { status: 400 });
    }
    
    if (!programIds || !Array.isArray(programIds) || programIds.length === 0) {
      return NextResponse.json({ success: false, message: 'Au moins un programme requis' }, { status: 400 });
    }

    const etapeNum = Number(etape);
    if (!Number.isInteger(etapeNum) || etapeNum < 1 || etapeNum > 6) {
      return NextResponse.json({ success: false, message: 'Étape invalide (entier de 1 à 6)' }, { status: 400 });
    }

    // --- VÉRIFICATIONS EN BASE ---
    // 1. Vérifier l'unicité du code (si fourni)
    if (code) {
      const existingCode = await prisma.course.findUnique({ 
        where: { code: code.trim() } 
      });
      if (existingCode) {
        return NextResponse.json({ success: false, message: `Le code "${code}" est déjà utilisé` }, { status: 409 });
      }
    }

    // 2. Vérifier que tous les programIds existent en base
    const programmesExistants = await prisma.program.findMany({
      where: { id: { in: programIds } },
      select: { id: true }
    });
    
    if (programmesExistants.length !== programIds.length) {
      return NextResponse.json({ success: false, message: 'Un ou plusieurs programmes sélectionnés sont invalides' }, { status: 400 });
    }
    // Validation compétences (optionnelles)
    const skills = Array.isArray(courseSkills) ? courseSkills : [];
    if (skills.length > 0) {
      const skillExisting = await prisma.skill.findMany({
        where: { id: { in: skills.map(s => s.skillId) } },
        select: { id: true },
      });
      if (skillExisting.length !== skills.length) {
        return NextResponse.json({ success: false, message: 'Une ou plusieurs compétences sélectionnées sont invalides' }, { status: 400 });
      }
    }

    // --- CRÉATION ---
    const nouveauCours = await prisma.course.create({
      data: {
        nom: nom.trim(),
        code: code?.trim(),
        etape: etapeNum,
        programs: { connect: programIds.map(id => ({ id })) },
        ...(skills.length > 0 ? {
          courseSkills: {
            create: skills.map(s => ({
              skillId:       s.skillId,
              niveauRequis:  s.niveauRequis  ?? 'DEBUTANT',
              poidsCritique: s.poidsCritique ?? 1,
            })),
          },
        } : {}),
      },
    });

    // Fetch programs via raw SQL (PrismaPg 7.x driver adapter bug with implicit M2M include).
    const rows = await prisma.$queryRaw`
      SELECT p.id, p.nom
      FROM "_CourseToProgram" cp
      JOIN "Program" p ON p.id = cp."B"
      WHERE cp."A" = ${nouveauCours.id}
    `;

    await prisma.auditLog.create({
      data: {
        action: "CREATE",
        entityType: "COURS",
        entityId: nouveauCours.id,
        userId: session.user.id,
        metadata: {
          email: session.user.email,
          role: session.user.role,
          message: "Cours créé",
          nom: nouveauCours.nom,
          code: nouveauCours.code,
        },
        ipAddress: getIp(request),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Cours créé avec succès',
      data: { ...nouveauCours, programs: rows },
    }, { status: 201 });

  } catch (error) {
    console.error('[ERREUR_POST_COURS]:', error);
    
    if (error.code === 'P2002') {
      return NextResponse.json({ success: false, message: 'Conflit : Ce code existe déjà' }, { status: 409 });
    }
    
    return NextResponse.json({ success: false, message: 'Erreur interne du serveur' }, { status: 500 });
  }
}