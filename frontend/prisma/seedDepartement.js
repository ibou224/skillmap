import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg }    from '@prisma/adapter-pg'
import 'dotenv/config'

const adapter = new PrismaPg(process.env.DATABASE_URL)
const prisma  = new PrismaClient({ adapter })

async function main() {
  console.log('Insertion des départements du Collège La Cité...\n')

  const departements = [
    {
      code: 'AGR',
      nom: 'Agriculture et Environnement',
      description:
        "Planification, gestion, production et commercialisation dans les domaines de l'agriculture, de l'agroalimentaire et de l'environnement forestier.",
    },
    {
      code: 'ADM',
      nom: 'Administration',
      description:
        "Formation en comptabilité, finance, marketing, ressources humaines et administration publique pour contribuer à la prospérité des entreprises à l'ère numérique.",
    },
    {
      code: 'ARC',
      nom: 'Architecture, Génie civil, Construction et Mécanique',
      description:
        'Formation pratique en architecture, génie civil, construction, génie électrique et mécanique axée sur le développement durable et les nouvelles technologies.',
    },
    {
      code: 'ART',
      nom: 'Arts, Design, Médias et Communication',
      description:
        'Maîtrise des nouvelles technologies dans les domaines du design graphique, des arts numériques, du journalisme, de la publicité et des communications numériques.',
    },
    {
      code: 'INF',
      nom: 'Informatique',
      description:
        "Formation en programmation, intelligence artificielle, cybersécurité, sciences des données et génie informatique pour intégrer des équipes d'innovation dans tous les secteurs de l'industrie.",
    },
    {
      code: 'HOT',
      nom: 'Hôtellerie',
      description:
        "Formation en arts culinaires, gestion culinaire, nutrition, hôtellerie et restauration pour une carrière créative et dynamique dans le secteur de l'hébergement et de la restauration.",
    },
    {
      code: 'SAN',
      nom: 'Sciences de la Santé et de la Vie',
      description:
        'Formation de professionnels de la santé en soins infirmiers, hygiène dentaire, pharmacie, biotechnologie, thérapie respiratoire et autres disciplines cliniques.',
    },
    {
      code: 'SSH',
      nom: 'Sciences Sociales et Humaines',
      description:
        "Formation en travail social, éducation à l'enfance, criminologie, autisme et sciences du comportement pour contribuer au bien-être des personnes et des communautés.",
    },
    {
      code: 'SUR',
      nom: "Services d'Urgence et Services Juridiques",
      description:
        "Formation en techniques policières, soins paramédicaux, services d'incendie, droit et parajurisme dans des installations ultraréalistes incluant simulateurs et tribunal-école.",
    },
    {
      code: 'APP',
      nom: "Programmes d'Apprentissage",
      description:
        "Formation en milieu de travail rémunérée dans les métiers spécialisés : charpenterie, électricité, soudage, plomberie, mécanique industrielle et développement de l'enfant.",
    },
  ]

  let inserted = 0
  let skipped = 0

  for (const dept of departements) {
    const existing = await prisma.departement.findUnique({
      where: { code: dept.code },
    })

    if (existing) {
      console.log(`Déjà existant : ${dept.code} — ${dept.nom}`)
      skipped++
    } else {
      await prisma.departement.create({ data: dept })
      console.log(`Inséré : ${dept.code} — ${dept.nom}`)
      inserted++
    }
  }

  console.log(`\nRésumé :`)
  console.log(`   Insérés  : ${inserted}`)
  console.log(`   Ignorés  : ${skipped}`)
  console.log(`   Total    : ${departements.length}`)
}

main()
  .catch((e) => {
    console.error('Erreur lors du seed :', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
