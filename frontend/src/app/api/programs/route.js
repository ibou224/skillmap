/**
 * @module app/api/programes/route
 * @description Route API pour récupérer la liste des programmes.
 */

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma.js';

/**
 * Route GET /api/programmes
 *
 * Récupère la liste de tous les programmes d'études actifs avec leurs départements associés.
 *
 * Processus :
 * 1. Requêter la table Programme en filtrant uniquement les éléments actifs
 * 2. Inclure les données du département avec une sélection stricte (Data Minimization)
 * 3. Trier les résultats par ordre alphabétique pour l'interface utilisateur
 * 4. Retourner un objet de réponse standardisé avec le nombre d'éléments (count)
 *
 * @returns {NextResponse} Réponse JSON avec la liste des programmes
 *
 * Codes de réponse :
 * - 200 : Succès de la récupération
 * - 500 : Erreur serveur lors de la requête à la base de données
 */
export async function GET() {
  try {
    const programmes = await prisma.program.findMany({
      include: {
        departement: {
          select: {
            nom: true,
            code: true
          }
        }
      },
      orderBy: {
        nom: 'asc'
      }
    });

    return NextResponse.json(
      {
        success: true,
        data: programmes,
        count: programmes.length
      }, 
      { status: 200 }
    );

  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: 'Erreur lors de la récupération des programmes',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      }, 
      { status: 500 }
    );
  }
}
