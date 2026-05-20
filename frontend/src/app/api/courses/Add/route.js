/**
 * @module app/api/courses/add/route
 * @description Route API pour créer un nouveau cours.
 */

import { NextResponse } from 'next/server';
import prisma from "@/lib/prisma.js";
import { isValidString } from '@/lib/validation';

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
  try {
    const body = await request.json();
    const { nom, code, programIds, etape } = body;

    if (!isValidString(nom)) {
      return NextResponse.json({ success: false, message: 'Nom invalide (caractères spéciaux interdits)' }, { status: 400 });
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

    // --- CRÉATION ---
    // Grâce à la relation many-to-many implicite de Prisma, on peut lier 
    // les programmes directement lors de la création avec "connect".
    const nouveauCours = await prisma.course.create({
      data: {
        nom: nom.trim(),
        code: code?.trim(),
        etape: etapeNum,
        programs: {
          connect: programIds.map(id => ({ id }))
        }
      },
      include: {
        programs: {
          select: { id: true, nom: true }
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Cours créé avec succès',
      data: nouveauCours
    }, { status: 201 });

  } catch (error) {
    console.error('[ERREUR_POST_COURS]:', error);
    
    if (error.code === 'P2002') {
      return NextResponse.json({ success: false, message: 'Conflit : Ce code existe déjà' }, { status: 409 });
    }
    
    return NextResponse.json({ success: false, message: 'Erreur interne du serveur' }, { status: 500 });
  }
}