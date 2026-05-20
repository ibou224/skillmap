import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma.js';

/**
 * GET /api/courses
 * 
 * Récupère la liste des cours ou la liste des programmes 
 * selon les paramètres de recherche.
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    // 1. Gestion de la requête spécifique pour les programmes
    if (searchParams.get("programs") === "true") {
      const programmes = await prisma.program.findMany({
        orderBy: { nom: "asc" },
        select: { 
          id: true, 
          nom: true, 
          code: true 
        }
      });

      return NextResponse.json({ success: true, data: programmes }, { status: 200 });
    }

    // 2. Requête principale pour les cours
    const courses = await prisma.course.findMany({
      orderBy: { nom: "asc" },
      include: {
        programs: {
          select: {
            id: true,
            nom: true
          }
        },
        courseSkills: true 
      }
    });


    return NextResponse.json({ success: true, data: courses }, { status: 200 });

  } catch (error) {
    console.error("[GET_COURSES_ERROR]:", error);
    
    return NextResponse.json(
      { success: false, error: "Erreur interne du serveur lors de la récupération des données." }, 
      { status: 500 }
    );
  }
}