import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg }    from '@prisma/adapter-pg'
import 'dotenv/config'

const adapter = new PrismaPg(process.env.DATABASE_URL)
const prisma  = new PrismaClient({ adapter })

async function main() {
  console.log('Insertion des cours — Programmation Informatique (PI)\n')

  // Code du programme cible
  const PROGRAMME_CODE = 'INF-PI'

  // Vérifie que le programme existe
  const programme = await prisma.program.findUnique({
    where: { code: PROGRAMME_CODE },
  })

  if (!programme) {
    console.error(`Programme introuvable : ${PROGRAMME_CODE}`)
    console.error('Lance d\'abord seed-departements.js puis seed-programmes.js')
    process.exit(1)
  }

  const cours = [
    // ───────────────────────────────────────────────
    // ÉTAPE 1
    // ───────────────────────────────────────────────
    {
      code:  '030733-IFM',
      nom:   'Introduction à la programmation',
      etape: 1,
    },
    {
      code:  '025747-IFM',
      nom:   'Algèbre et trigonométrie',
      etape: 1,
    },
    {
      code:  '025748-IFM',
      nom:   "Introduction à la gestion d'un système d'exploitation",
      etape: 1,
    },
    {
      code:  '030832-IFM',
      nom:   'Réseau pour programmeur',
      etape: 1,
    },
    {
      code:  '030834-IFM',
      nom:   "Architecture de l'ordinateur pour programmeur",
      etape: 1,
    },

    // ───────────────────────────────────────────────
    // ÉTAPE 2
    // ───────────────────────────────────────────────
    {
      code:  '025906-IFM',
      nom:   'Introduction aux bases de données',
      etape: 2,
    },
    {
      code:  '025769-IFM',
      nom:   'Statistiques',
      etape: 2,
    },
    {
      code:  '025909-IFM',
      nom:   'Introduction à la programmation Web client',
      etape: 2,
    },
    {
      code:  '025907-IFM',
      nom:   'Développement d\'applications mobiles pour Android',
      etape: 2,
    },
    {
      code:  '025914-IFM',
      nom:   'Assurance de qualité logicielle',
      etape: 2,
    },
    {
      code:  '030737-IFM',
      nom:   'Programmation orientée objet',
      etape: 2,
    },

    // ───────────────────────────────────────────────
    // ÉTAPE 3
    // ───────────────────────────────────────────────
    {
      code:  '029990-IFM',
      nom:   'Introduction à la programmation de serveurs Web',
      etape: 3,
    },
    {
      code:  '025797-IFM',
      nom:   'Fondements de la cybersécurité',
      etape: 3,
    },
    {
      code:  '030739-IFM',
      nom:   'Développement d\'application de bureau',
      etape: 3,
    },
    {
      code:  '030742-IFM',
      nom:   'Analyse et conception de systèmes',
      etape: 3,
    },
    {
      code:  '030746-IFM',
      nom:   'Bases de données relationnelles avancées',
      etape: 3,
    },
    {
      code:  '025913-IFM',
      nom:   'Tests logiciels',
      etape: 3,
    },
    {
      code:  '029983-IFM',
      nom:   'Structures de données appliquées',
      etape: 3,
    },

    // ───────────────────────────────────────────────
    // ÉTAPE 4
    // ───────────────────────────────────────────────
    {
      code:  '025921-IFM',
      nom:   'Développement d\'applications mobiles pour iOS',
      etape: 4,
    },
    {
      code:  '029991-IFM',
      nom:   'Programmation Web avancé',
      etape: 4,
    },
    {
      code:  '026035-IFM',
      nom:   'Systèmes de gestion de bases de données',
      etape: 4,
    },
    {
      code:  '030747-IFM',
      nom:   'Projet intégrateur',
      etape: 4,
    },
    {
      code:  '030505-IFM',
      nom:   "Initiation à l'intelligence artificielle",
      etape: 4,
    },
    {
      code:  '025922-IFM',
      nom:   'Patrons de conception',
      etape: 4,
    },
  ]

  let inserted = 0
  let skipped  = 0

  for (const c of cours) {
    const existing = await prisma.course.findUnique({
      where: { code: c.code },
    })

    if (existing) {
      // Si le cours existe, s'assurer qu'il est lié au programme
      const dejalie = existing.programs?.some(p => p.id === programme.id)
      if (!dejalie) {
        await prisma.course.update({
          where: { code: c.code },
          data: {
            programs: { connect: { id: programme.id } },
          },
        })
        console.log(`Lié au programme : ${c.code} — ${c.nom}`)
      } else {
        console.log(`Déjà existant   : ${c.code} — ${c.nom}`)
      }
      skipped++
    } else {
      await prisma.course.create({
        data: {
          code:     c.code,
          nom:      c.nom,
          etape:    c.etape,
          programs: { connect: { id: programme.id } },
        },
      })
      console.log(`Inséré [Étape ${c.etape}] : ${c.code} — ${c.nom}`)
      inserted++
    }
  }

  console.log(`\nRésumé — Programme : ${PROGRAMME_CODE}`)
  console.log(`   Insérés  : ${inserted}`)
  console.log(`   Ignorés  : ${skipped}`)
  console.log(`   Total    : ${cours.length}`)
}

main()
  .catch((e) => {
    console.error('Erreur lors du seed :', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
