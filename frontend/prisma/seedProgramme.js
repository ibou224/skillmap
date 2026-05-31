import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg }    from '@prisma/adapter-pg'
import 'dotenv/config'

const adapter = new PrismaPg(process.env.DATABASE_URL)
const prisma  = new PrismaClient({ adapter })

async function main() {
  console.log('Insertion des programmes du Collège La Cité...\n')

  const programmes = [
    {
      code: 'AGR-PAG',
      nom: 'Techniques agricoles – production animale et grandes cultures',
      nbEtapes: 4,
      departementCode: 'AGR',
    },
    {
      code: 'AGR-PFL',
      nom: 'Techniques agricoles – production de fruits et légumes',
      nbEtapes: 4,
      departementCode: 'AGR',
    },

    {
      code: 'ADM-ADA',
      nom: 'Administration des affaires',
      nbEtapes: 6,
      departementCode: 'ADM',
    },
    {
      code: 'ADM-ADC',
      nom: 'Administration des affaires – comptabilité',
      nbEtapes: 6,
      departementCode: 'ADM',
    },
    {
      code: 'ADM-ADF',
      nom: 'Administration des affaires – finance',
      nbEtapes: 6,
      departementCode: 'ADM',
    },


    // ───────────────────────────────────────────────
    // ARCHITECTURE, GÉNIE CIVIL, CONSTRUCTION ET MÉCANIQUE
    // ───────────────────────────────────────────────
    {
      code: 'ARC-TAR',
      nom: "Technologie de l'architecture",
      nbEtapes: 6,
      departementCode: 'ARC',
    },
    {
      code: 'ARC-TGC',
      nom: 'Technologie du génie civil – construction',
      nbEtapes: 6,
      departementCode: 'ARC',
    },
    {
      code: 'ART-AN3',
      nom: 'Animation 3D',
      nbEtapes: 4,
      departementCode: 'ART',
    },
    {
      code: 'ART-ANA',
      nom: 'Animation 3D (avancé)',
      nbEtapes: 6,
      departementCode: 'ART',
    },
    {
      code: 'ART-DGR',
      nom: 'Design graphique',
      nbEtapes: 6,
      departementCode: 'ART',
    },
    {
      code: 'INF-BCD',
      nom: 'Baccalauréat en cybersécurité et protection des données',
      nbEtapes: 6,
      departementCode: 'INF',
    },
    {
      code: 'INF-BCA',
      nom: 'Baccalauréat spécialisé en cybersécurité – défense et contre-attaque',
      nbEtapes: 8,
      departementCode: 'INF',
    },
    {
      code: 'INF-IAA',
      nom: 'Intelligence artificielle appliquée',
      nbEtapes: 2,
      departementCode: 'INF',
    },
    {
      code: 'INF-IAI',
      nom: 'Intelligence artificielle en informatique',
      nbEtapes: 4,
      departementCode: 'INF',
    },
    {
      code: 'INF-PI',
      nom: 'Programmation informatique',
      nbEtapes: 4,
      departementCode: 'INF',
    },
    {
      code: 'INF-SDA',
      nom: 'Sciences des données appliquées',
      nbEtapes: 4,
      departementCode: 'INF',
    },
    {
      code: 'INF-STI',
      nom: 'Soutien technique en informatique',
      nbEtapes: 2,
      departementCode: 'INF',
    },
    {
      code: 'INF-TSI',
      nom: 'Techniques des systèmes informatiques',
      nbEtapes: 4,
      departementCode: 'INF',
    },
    {
      code: 'INF-TGI',
      nom: 'Technologie du génie informatique',
      nbEtapes: 6,
      departementCode: 'INF',
    },
    {
      code: 'INF-TSC',
      nom: 'Technologie des systèmes informatiques – cybersécurité et réseautique',
      nbEtapes: 6,
      departementCode: 'INF',
    },
    {
      code: 'HOT-HGS',
      nom: "Hôtellerie – gestion des services d'hébergement et de restauration",
      nbEtapes: 4,
      departementCode: 'HOT',
    },
    {
      code: 'HOT-SRE',
      nom: 'Service de la restauration',
      nbEtapes: 2,
      departementCode: 'HOT',
    },
    {
      code: 'SAN-BSI',
      nom: 'Baccalauréat en sciences infirmières',
      nbEtapes: 8,
      departementCode: 'SAN',
    },
    {
      code: 'SAN-PSP',
      nom: 'Préposé aux services de soutien personnel',
      nbEtapes: 2,
      departementCode: 'SAN',
    },
    {
      code: 'SSH-TIC',
      nom: 'Techniques d\'intervention en criminologie',
      nbEtapes: 4,
      departementCode: 'SSH',
    },
    {
      code: 'SSH-TTS',
      nom: 'Techniques de travail social',
      nbEtapes: 4,
      departementCode: 'SSH',
    },
    {
      code: 'SUR-SPC',
      nom: 'Soins paramédicaux avancés',
      nbEtapes: 4,
      departementCode: 'SUR',
    },
    {
      code: 'SUR-TSP',
      nom: 'Techniques des services policiers',
      nbEtapes: 4,
      departementCode: 'SUR',
    },

    // ───────────────────────────────────────────────
    // PROGRAMMES D'APPRENTISSAGE
    // ───────────────────────────────────────────────
    {
      code: 'APP-CHA',
      nom: 'Charpentier-menuisier',
      nbEtapes: 3,
      departementCode: 'APP',
    },
    {
      code: 'APP-ELE',
      nom: 'Électricien – construction et entretien',
      nbEtapes: 4,
      departementCode: 'APP',
    },
  ]

  let inserted = 0
  let skipped = 0

  for (const prog of programmes) {
    const departement = await prisma.departement.findUnique({
      where: { code: prog.departementCode },
    })

    if (!departement) {
      console.log(`Département introuvable pour le code : ${prog.departementCode} — lance d'abord seed-departements.js`)
      continue
    }

    const existing = await prisma.program.findUnique({
      where: { code: prog.code },
    })

    if (existing) {
      console.log(`Déjà existant : ${prog.code} — ${prog.nom}`)
      skipped++
    } else {
      await prisma.program.create({
        data: {
          code:         prog.code,
          nom:          prog.nom,
          nbEtapes:     prog.nbEtapes,
          departementId: departement.id,
        },
      })
      console.log(`Inséré : ${prog.code} — ${prog.nom}`)
      inserted++
    }
  }

  console.log(`\nRésumé :`)
  console.log(`   Insérés  : ${inserted}`)
  console.log(`   Ignorés  : ${skipped}`)
  console.log(`   Total    : ${programmes.length}`)
}

main()
  .catch((e) => {
    console.error('Erreur lors du seed :', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })