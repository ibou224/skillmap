import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg }    from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'
import 'dotenv/config'

const adapter = new PrismaPg(process.env.DATABASE_URL)
const prisma  = new PrismaClient({ adapter })

const BCRYPT_COST  = 10
const MOT_DE_PASSE = 'Prof@2026!'

const PROFESSEURS = [
  // ── INFORMATIQUE (8) ─────────────────────────────────────
  {
    email: 'marc.tremblay@lacitec.on.ca', nom: 'Tremblay', prenom: 'Marc',
    titre: 'M.', telephone: '613-555-0101', ville: 'Ottawa',
    siteWeb: 'https://marctremblay.dev',
    linkedIn: 'https://linkedin.com/in/marc-tremblay-dev',
    github: 'https://github.com/marctremblay',
    langues: ['Français', 'Anglais'],
    resume: "Développeur backend senior avec 12 ans d'expérience en Java et Python. Spécialiste en architecture logicielle, programmation orientée objet et bases de données relationnelles.",
  },
  {
    email: 'sophie.nguyen@lacitec.on.ca', nom: 'Nguyen', prenom: 'Sophie',
    titre: 'Mme', telephone: '613-555-0102', ville: 'Gatineau',
    linkedIn: 'https://linkedin.com/in/sophie-nguyen-web',
    github: 'https://github.com/sophienguyendev',
    langues: ['Français', 'Anglais', 'Vietnamien'],
    resume: "Développeuse fullstack spécialisée en React, Next.js et Node.js avec 9 ans d'expérience. Expertise en développement Web moderne et applications mobiles Android.",
  },
  {
    email: 'alexandre.belanger@lacitec.on.ca', nom: 'Bélanger', prenom: 'Alexandre',
    titre: 'M.', telephone: '613-555-0103', ville: 'Ottawa',
    github: 'https://github.com/alexbelanger',
    langues: ['Français', 'Anglais'],
    resume: "Expert en cybersécurité et réseaux informatiques avec 10 ans d'expérience. Certifié CISSP et CEH. Ancien consultant pour des agences gouvernementales canadiennes.",
  },
  {
    email: 'fatima.diallo@lacitec.on.ca', nom: 'Diallo', prenom: 'Fatima',
    titre: 'Mme', telephone: '613-555-0104', ville: 'Ottawa',
    linkedIn: 'https://linkedin.com/in/fatima-diallo-ia',
    github: 'https://github.com/fatimadiallo-ml',
    langues: ['Français', 'Anglais', 'Wolof'],
    resume: "Docteure en apprentissage automatique avec 10 ans d'expérience. Experte en apprentissage profond, vision par ordinateur et IA générative. Publications à NeurIPS et ICML.",
  },
  {
    email: 'kevin.laroche@lacitec.on.ca', nom: 'Laroche', prenom: 'Kevin',
    titre: 'M.', telephone: '613-555-0105', ville: 'Ottawa',
    github: 'https://github.com/kevinlaroche-ios',
    langues: ['Français', 'Anglais'],
    resume: "Développeur mobile senior spécialisé iOS (Swift) et Android (Kotlin) avec 8 ans d'expérience. Fondateur de AppNorth Studio. 15+ applications publiées.",
  },
  {
    email: 'amina.cherif@lacitec.on.ca', nom: 'Chérif', prenom: 'Amina',
    titre: 'Mme', telephone: '613-555-0106', ville: 'Gatineau',
    linkedIn: 'https://linkedin.com/in/amina-cherif-data',
    langues: ['Français', 'Anglais', 'Arabe'],
    resume: "Ingénieure données et MLOps avec 6 ans d'expérience. Certifiée AWS Solutions Architect. Expertise en Big Data, cloud computing et déploiement de modèles ML en production.",
  },
  {
    email: 'pierre.lacombe@lacitec.on.ca', nom: 'Lacombe', prenom: 'Pierre',
    titre: 'M.', telephone: '613-555-0107', ville: 'Ottawa',
    langues: ['Français', 'Anglais'],
    resume: "Architecte logiciel senior avec 15 ans d'expérience. Expert Agile/Scrum certifié. Spécialiste en analyse de systèmes, qualité logicielle et conduite de projets intégrateurs.",
  },
  {
    email: 'nadia.okonkwo@lacitec.on.ca', nom: 'Okonkwo', prenom: 'Nadia',
    titre: 'Mme', telephone: '613-555-0108', ville: 'Ottawa',
    linkedIn: 'https://linkedin.com/in/nadia-okonkwo-math',
    langues: ['Français', 'Anglais', 'Igbo'],
    resume: "Docteure en mathématiques appliquées (Queen's University). Spécialisée en mathématiques discrètes, algorithmes et algèbre linéaire pour l'IA. 8 ans d'enseignement universitaire.",
  },
  // ── TRAVAIL SOCIAL (2) ───────────────────────────────────
  {
    email: 'marie-claire.bouchard@lacitec.on.ca', nom: 'Bouchard', prenom: 'Marie-Claire',
    titre: 'Mme', telephone: '613-555-0109', ville: 'Ottawa',
    linkedIn: 'https://linkedin.com/in/marie-claire-bouchard-ts',
    langues: ['Français', 'Anglais'],
    resume: "Travailleuse sociale clinique certifiée (OTSTTSO) avec 18 ans de pratique. Superviseure et formatrice spécialisée en santé mentale, gestion de crise et dépendances.",
  },
  {
    email: 'jean-pierre.morin@lacitec.on.ca', nom: 'Morin', prenom: 'Jean-Pierre',
    titre: 'M.', telephone: '613-555-0110', ville: 'Ottawa',
    langues: ['Français', 'Anglais', 'Espagnol'],
    resume: "Travailleur social spécialisé en gérontologie et protection de la jeunesse avec 14 ans d'expérience. Expert en relations interculturelles et accompagnement des personnes vulnérables.",
  },
]

async function main() {
  console.log('Seed — Création des comptes professeurs\n')

  let inseres = 0
  let ignores = 0

  for (const data of PROFESSEURS) {
    const existing = await prisma.user.findUnique({ where: { email: data.email } })

    if (existing) {
      console.log(`Déjà existant : ${data.prenom} ${data.nom}`)
      ignores++
      continue
    }

    const passwordHash = await bcrypt.hash(MOT_DE_PASSE, BCRYPT_COST)

    const user = await prisma.user.create({
      data: {
        email:        data.email,
        nom:          data.nom,
        prenom:       data.prenom,
        passwordHash,
        role:         'PROFESSEUR',
        professor: {
          create: {
            titre:     data.titre     ?? null,
            telephone: data.telephone ?? null,
            ville:     data.ville     ?? null,
            siteWeb:   data.siteWeb   ?? null,
            linkedIn:  data.linkedIn  ?? null,
            github:    data.github    ?? null,
            langues:   data.langues   ?? [],
            resume:    data.resume    ?? null,
          },
        },
      },
    })

    console.log(`Inséré : ${data.prenom} ${data.nom} — ${data.email}`)
    inseres++
  }

  console.log(`\nRésumé`)
  console.log(`  Insérés  : ${inseres}`)
  console.log(`  Ignorés  : ${ignores}`)
  console.log(`  Total    : ${PROFESSEURS.length}`)
  console.log(`\n  Mot de passe par défaut : ${MOT_DE_PASSE}`)
  console.log(`  CVs PDF à uploader via l'interface pour déclencher l'extraction IA.`)
}

main()
  .catch((e) => { console.error('Erreur :', e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })