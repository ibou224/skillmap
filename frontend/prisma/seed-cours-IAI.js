import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg }    from '@prisma/adapter-pg'
import 'dotenv/config'

const adapter = new PrismaPg(process.env.DATABASE_URL)
const prisma  = new PrismaClient({ adapter })

const PROGRAMME_CODE = 'INF-IAI'

// ─────────────────────────────────────────────────────────────
// COMPÉTENCES SPÉCIFIQUES À L'IAI
// (celles déjà insérées par seed-skills-PI.js seront ignorées)
// ─────────────────────────────────────────────────────────────
const SKILLS = [
  // Déjà dans PI — seront skippées si existantes
  { nom: 'Python',                        categorie: 'Programmation',    description: 'Langage de programmation généraliste et IA' },
  { nom: 'SQL',                           categorie: 'Base de données',  description: 'Requêtes SQL : SELECT, JOIN, transactions, indexation' },
  { nom: 'Structures de données',         categorie: 'Programmation',    description: 'Listes, arbres, graphes, piles, files' },
  { nom: 'Algorithmes',                   categorie: 'Programmation',    description: 'Conception et analyse d\'algorithmes' },
  { nom: 'Programmation orientée objet',  categorie: 'Programmation',    description: 'Concepts POO : classes, héritage, polymorphisme, encapsulation' },
  { nom: 'HTML/CSS',                      categorie: 'Développement Web', description: 'Structure et style des pages Web' },
  { nom: 'JavaScript',                    categorie: 'Développement Web', description: 'Langage du Web client et serveur (Node.js)' },
  { nom: 'Linux',                         categorie: 'Systèmes',          description: 'Administration et commandes Linux/Unix' },
  { nom: 'Statistiques',                  categorie: 'Mathématiques',     description: 'Statistiques descriptives et inférentielles, probabilités' },
  { nom: 'Algèbre',                       categorie: 'Mathématiques',     description: 'Algèbre linéaire et structures algébriques' },
  { nom: 'Intelligence artificielle',     categorie: 'IA & Données',      description: 'Concepts IA : apprentissage automatique, réseaux de neurones, NLP' },
  { nom: 'API REST',                      categorie: 'Développement Web', description: 'Conception et consommation d\'API RESTful' },
  { nom: 'Node.js',                       categorie: 'Développement Web', description: 'Environnement d\'exécution JavaScript côté serveur' },
  { nom: 'Assurance qualité',             categorie: 'Qualité',           description: 'Processus QA, revue de code, métriques de qualité' },
  { nom: 'Tests logiciels',               categorie: 'Qualité',           description: 'Tests unitaires, d\'intégration, TDD, outils de tests automatisés' },
  { nom: 'Analyse et conception',         categorie: 'Génie logiciel',    description: 'UML, diagrammes de cas d\'utilisation, architecture logicielle' },
  { nom: 'Gestion de projet logiciel',    categorie: 'Génie logiciel',    description: 'Méthodologies Agile, Scrum, gestion des exigences' },

  // Nouvelles compétences spécifiques IAI
  { nom: 'Mathématiques discrètes',       categorie: 'Mathématiques',     description: 'Logique, ensembles, graphes, combinatoire et algèbre linéaire pour l\'IA' },
  { nom: 'Apprentissage automatique',     categorie: 'IA & Données',      description: 'Régression, classification, clustering, validation de modèles ML' },
  { nom: 'Apprentissage profond',         categorie: 'IA & Données',      description: 'Réseaux de neurones, CNN, RNN, transformers et frameworks (TensorFlow, PyTorch)' },
  { nom: 'Traitement des données',        categorie: 'IA & Données',      description: 'Collecte, nettoyage, transformation et visualisation de données' },
  { nom: 'Big Data',                      categorie: 'IA & Données',      description: 'Bases de données massives, Hadoop, Spark, traitement distribué' },
  { nom: 'Cloud Computing',              categorie: 'Systèmes',           description: 'Outils infonuagiques : AWS, Azure, GCP, déploiement de modèles IA' },
  { nom: 'IA Générative',                categorie: 'IA & Données',       description: 'LLMs, prompting, RAG, génération d\'images et de texte (GPT, Stable Diffusion)' },
  { nom: 'MLOps',                        categorie: 'IA & Données',       description: 'Déploiement, versionnage et monitoring de modèles IA en production' },
  { nom: 'Éthique en IA',               categorie: 'IA & Données',       description: 'Biais algorithmiques, droit, confidentialité et impact social de l\'IA' },
  { nom: 'Vision par ordinateur',        categorie: 'IA & Données',       description: 'Traitement d\'images, détection d\'objets, segmentation avec CNN' },
  { nom: 'Communication professionnelle', categorie: 'Compétences transversales', description: 'Communication écrite et orale en contexte professionnel et d\'entreprise' },
  { nom: 'Veille technologique',         categorie: 'Compétences transversales', description: 'Recherche appliquée, lecture de publications scientifiques, tendances IA' },
]

// ─────────────────────────────────────────────────────────────
// COURS DU PROGRAMME IAI — 4 ÉTAPES
// ─────────────────────────────────────────────────────────────
const COURS = [
  // ── ÉTAPE 1 ──────────────────────────────────────────────
  { code: '030464-IFM', nom: 'Logique de programmation',                          etape: 1 },
  { code: '030476-IFM', nom: 'Mathématiques',                                     etape: 1 },
  { code: '025748-IFM', nom: "Introduction à la gestion d'un système d'exploitation", etape: 1 },
  { code: '030467-IFM', nom: 'Fondement des statistiques pour les sciences de données', etape: 1 },
  { code: '030472-IFM', nom: 'Techniques de bases de données',                    etape: 1 },

  // ── ÉTAPE 2 ──────────────────────────────────────────────
  { code: '030489-IFM', nom: 'Programmation avancée',                             etape: 2 },
  { code: '025909-IFM', nom: 'Introduction à la programmation Web client',        etape: 2 },
  { code: '030501-IFM', nom: 'Structures de données',                             etape: 2 },
  { code: '031095-IFM', nom: "Traitement des données pour l'IA",                  etape: 2 },
  { code: '031099-IFM', nom: "Fondements théoriques et pratiques de l'IA",        etape: 2 },
  { code: '030497-IFM', nom: 'Outils infonuagiques',                              etape: 2 },
  { code: '030509-IFM', nom: 'Introduction aux bases de données massives',        etape: 2 },

  // ── ÉTAPE 3 ──────────────────────────────────────────────
  { code: '031103-IFM', nom: 'Apprentissage machine appliqué',                    etape: 3 },
  { code: '031107-IFM', nom: 'Apprentissage profond appliqué',                    etape: 3 },
  { code: '031111-IFM', nom: 'Projet IA : Méthodologie et déploiement',           etape: 3 },
  { code: '029990-IFM', nom: 'Introduction à la programmation de serveurs Web',   etape: 3 },
  { code: '025914-IFM', nom: 'Assurance de qualité logicielle',                   etape: 3 },
  { code: '030742-IFM', nom: 'Analyse et conception de systèmes',                 etape: 3 },

  // ── ÉTAPE 4 ──────────────────────────────────────────────
  { code: '031115-IFM', nom: 'Apprentissage profond appliqué avancé',             etape: 4 },
  { code: '031119-IFM', nom: 'Projet Capstone en IA',                             etape: 4 },
  { code: '031120-IFM', nom: "Droit et éthique de l'IA",                          etape: 4 },
  { code: '031124-IFM', nom: 'Intelligence Artificielle Générative',              etape: 4 },
  { code: '030542-IFM', nom: 'Communication en entreprise',                       etape: 4 },
  { code: '031128-IFM', nom: 'Tendances et Recherche Appliquée en IA',            etape: 4 },
]

// ─────────────────────────────────────────────────────────────
// MAPPING COURS → COMPÉTENCES
// ─────────────────────────────────────────────────────────────
const COURS_SKILLS = {

  // ── ÉTAPE 1 ──────────────────────────────────────────────
  '030464-IFM': [ // Logique de programmation
    { nom: 'Python',                      niveauRequis: 'DEBUTANT',      poidsCritique: 3 },
    { nom: 'Algorithmes',                 niveauRequis: 'DEBUTANT',      poidsCritique: 3 },
    { nom: 'Structures de données',       niveauRequis: 'DEBUTANT',      poidsCritique: 2 },
  ],
  '030476-IFM': [ // Mathématiques
    { nom: 'Mathématiques discrètes',     niveauRequis: 'DEBUTANT',      poidsCritique: 3 },
    { nom: 'Algèbre',                     niveauRequis: 'DEBUTANT',      poidsCritique: 3 },
    { nom: 'Statistiques',                niveauRequis: 'DEBUTANT',      poidsCritique: 2 },
  ],
  '025748-IFM': [ // Introduction à la gestion d'un système d'exploitation
    { nom: 'Linux',                       niveauRequis: 'DEBUTANT',      poidsCritique: 3 },
  ],
  '030467-IFM': [ // Fondement des statistiques pour les sciences de données
    { nom: 'Statistiques',                niveauRequis: 'INTERMEDIAIRE', poidsCritique: 3 },
    { nom: 'Mathématiques discrètes',     niveauRequis: 'DEBUTANT',      poidsCritique: 2 },
    { nom: 'Python',                      niveauRequis: 'DEBUTANT',      poidsCritique: 2 },
  ],
  '030472-IFM': [ // Techniques de bases de données
    { nom: 'SQL',                         niveauRequis: 'DEBUTANT',      poidsCritique: 3 },
    { nom: 'Traitement des données',      niveauRequis: 'DEBUTANT',      poidsCritique: 2 },
  ],

  // ── ÉTAPE 2 ──────────────────────────────────────────────
  '030489-IFM': [ // Programmation avancée
    { nom: 'Python',                      niveauRequis: 'INTERMEDIAIRE', poidsCritique: 3 },
    { nom: 'Programmation orientée objet',niveauRequis: 'INTERMEDIAIRE', poidsCritique: 3 },
    { nom: 'Algorithmes',                 niveauRequis: 'INTERMEDIAIRE', poidsCritique: 2 },
    { nom: 'Structures de données',       niveauRequis: 'INTERMEDIAIRE', poidsCritique: 2 },
  ],
  '025909-IFM': [ // Introduction à la programmation Web client
    { nom: 'HTML/CSS',                    niveauRequis: 'DEBUTANT',      poidsCritique: 3 },
    { nom: 'JavaScript',                  niveauRequis: 'DEBUTANT',      poidsCritique: 3 },
  ],
  '030501-IFM': [ // Structures de données
    { nom: 'Structures de données',       niveauRequis: 'INTERMEDIAIRE', poidsCritique: 3 },
    { nom: 'Algorithmes',                 niveauRequis: 'INTERMEDIAIRE', poidsCritique: 3 },
    { nom: 'Python',                      niveauRequis: 'INTERMEDIAIRE', poidsCritique: 2 },
  ],
  '031095-IFM': [ // Traitement des données pour l'IA
    { nom: 'Traitement des données',      niveauRequis: 'INTERMEDIAIRE', poidsCritique: 3 },
    { nom: 'Python',                      niveauRequis: 'INTERMEDIAIRE', poidsCritique: 3 },
    { nom: 'Statistiques',                niveauRequis: 'INTERMEDIAIRE', poidsCritique: 2 },
    { nom: 'Intelligence artificielle',   niveauRequis: 'DEBUTANT',      poidsCritique: 2 },
  ],
  '031099-IFM': [ // Fondements théoriques et pratiques de l'IA
    { nom: 'Intelligence artificielle',   niveauRequis: 'INTERMEDIAIRE', poidsCritique: 3 },
    { nom: 'Apprentissage automatique',   niveauRequis: 'DEBUTANT',      poidsCritique: 3 },
    { nom: 'Python',                      niveauRequis: 'INTERMEDIAIRE', poidsCritique: 3 },
    { nom: 'Mathématiques discrètes',     niveauRequis: 'INTERMEDIAIRE', poidsCritique: 2 },
    { nom: 'Statistiques',                niveauRequis: 'INTERMEDIAIRE', poidsCritique: 2 },
  ],
  '030497-IFM': [ // Outils infonuagiques
    { nom: 'Cloud Computing',            niveauRequis: 'DEBUTANT',      poidsCritique: 3 },
    { nom: 'Intelligence artificielle',   niveauRequis: 'DEBUTANT',      poidsCritique: 2 },
    { nom: 'SQL',                         niveauRequis: 'DEBUTANT',      poidsCritique: 1 },
  ],
  '030509-IFM': [ // Introduction aux bases de données massives
    { nom: 'Big Data',                    niveauRequis: 'DEBUTANT',      poidsCritique: 3 },
    { nom: 'SQL',                         niveauRequis: 'INTERMEDIAIRE', poidsCritique: 2 },
    { nom: 'Traitement des données',      niveauRequis: 'INTERMEDIAIRE', poidsCritique: 2 },
    { nom: 'Cloud Computing',            niveauRequis: 'DEBUTANT',      poidsCritique: 1 },
  ],

  // ── ÉTAPE 3 ──────────────────────────────────────────────
  '031103-IFM': [ // Apprentissage machine appliqué
    { nom: 'Apprentissage automatique',   niveauRequis: 'INTERMEDIAIRE', poidsCritique: 3 },
    { nom: 'Python',                      niveauRequis: 'AVANCE',        poidsCritique: 3 },
    { nom: 'Statistiques',                niveauRequis: 'AVANCE',        poidsCritique: 3 },
    { nom: 'Traitement des données',      niveauRequis: 'INTERMEDIAIRE', poidsCritique: 2 },
    { nom: 'Intelligence artificielle',   niveauRequis: 'INTERMEDIAIRE', poidsCritique: 2 },
  ],
  '031107-IFM': [ // Apprentissage profond appliqué
    { nom: 'Apprentissage profond',       niveauRequis: 'INTERMEDIAIRE', poidsCritique: 3 },
    { nom: 'Apprentissage automatique',   niveauRequis: 'INTERMEDIAIRE', poidsCritique: 3 },
    { nom: 'Python',                      niveauRequis: 'AVANCE',        poidsCritique: 3 },
    { nom: 'Vision par ordinateur',       niveauRequis: 'DEBUTANT',      poidsCritique: 2 },
    { nom: 'Mathématiques discrètes',     niveauRequis: 'AVANCE',        poidsCritique: 2 },
  ],
  '031111-IFM': [ // Projet IA : Méthodologie et déploiement
    { nom: 'MLOps',                       niveauRequis: 'INTERMEDIAIRE', poidsCritique: 3 },
    { nom: 'Gestion de projet logiciel',  niveauRequis: 'INTERMEDIAIRE', poidsCritique: 3 },
    { nom: 'Cloud Computing',            niveauRequis: 'INTERMEDIAIRE', poidsCritique: 3 },
    { nom: 'Apprentissage automatique',   niveauRequis: 'INTERMEDIAIRE', poidsCritique: 2 },
    { nom: 'Tests logiciels',             niveauRequis: 'DEBUTANT',      poidsCritique: 1 },
  ],
  '029990-IFM': [ // Introduction à la programmation de serveurs Web
    { nom: 'Node.js',                     niveauRequis: 'DEBUTANT',      poidsCritique: 3 },
    { nom: 'API REST',                    niveauRequis: 'DEBUTANT',      poidsCritique: 3 },
    { nom: 'JavaScript',                  niveauRequis: 'INTERMEDIAIRE', poidsCritique: 2 },
    { nom: 'SQL',                         niveauRequis: 'DEBUTANT',      poidsCritique: 1 },
  ],
  '025914-IFM': [ // Assurance de qualité logicielle
    { nom: 'Assurance qualité',           niveauRequis: 'INTERMEDIAIRE', poidsCritique: 3 },
    { nom: 'Tests logiciels',             niveauRequis: 'INTERMEDIAIRE', poidsCritique: 3 },
  ],
  '030742-IFM': [ // Analyse et conception de systèmes
    { nom: 'Analyse et conception',       niveauRequis: 'INTERMEDIAIRE', poidsCritique: 3 },
    { nom: 'Gestion de projet logiciel',  niveauRequis: 'DEBUTANT',      poidsCritique: 2 },
  ],

  // ── ÉTAPE 4 ──────────────────────────────────────────────
  '031115-IFM': [ // Apprentissage profond appliqué avancé
    { nom: 'Apprentissage profond',       niveauRequis: 'AVANCE',        poidsCritique: 3 },
    { nom: 'Vision par ordinateur',       niveauRequis: 'INTERMEDIAIRE', poidsCritique: 3 },
    { nom: 'Python',                      niveauRequis: 'AVANCE',        poidsCritique: 3 },
    { nom: 'MLOps',                       niveauRequis: 'INTERMEDIAIRE', poidsCritique: 2 },
    { nom: 'Mathématiques discrètes',     niveauRequis: 'AVANCE',        poidsCritique: 2 },
  ],
  '031119-IFM': [ // Projet Capstone en IA
    { nom: 'Intelligence artificielle',   niveauRequis: 'AVANCE',        poidsCritique: 3 },
    { nom: 'Gestion de projet logiciel',  niveauRequis: 'AVANCE',        poidsCritique: 3 },
    { nom: 'MLOps',                       niveauRequis: 'AVANCE',        poidsCritique: 3 },
    { nom: 'Apprentissage automatique',   niveauRequis: 'AVANCE',        poidsCritique: 3 },
    { nom: 'Communication professionnelle', niveauRequis: 'INTERMEDIAIRE', poidsCritique: 2 },
  ],
  '031120-IFM': [ // Droit et éthique de l'IA
    { nom: 'Éthique en IA',              niveauRequis: 'INTERMEDIAIRE', poidsCritique: 3 },
    { nom: 'Intelligence artificielle',   niveauRequis: 'INTERMEDIAIRE', poidsCritique: 2 },
    { nom: 'Communication professionnelle', niveauRequis: 'DEBUTANT',   poidsCritique: 1 },
  ],
  '031124-IFM': [ // Intelligence Artificielle Générative
    { nom: 'IA Générative',              niveauRequis: 'INTERMEDIAIRE', poidsCritique: 3 },
    { nom: 'Apprentissage profond',       niveauRequis: 'AVANCE',        poidsCritique: 3 },
    { nom: 'Python',                      niveauRequis: 'AVANCE',        poidsCritique: 2 },
    { nom: 'API REST',                    niveauRequis: 'INTERMEDIAIRE', poidsCritique: 2 },
  ],
  '030542-IFM': [ // Communication en entreprise
    { nom: 'Communication professionnelle', niveauRequis: 'INTERMEDIAIRE', poidsCritique: 3 },
    { nom: 'Gestion de projet logiciel',  niveauRequis: 'DEBUTANT',      poidsCritique: 1 },
  ],
  '031128-IFM': [ // Tendances et Recherche Appliquée en IA
    { nom: 'Veille technologique',        niveauRequis: 'INTERMEDIAIRE', poidsCritique: 3 },
    { nom: 'IA Générative',              niveauRequis: 'INTERMEDIAIRE', poidsCritique: 2 },
    { nom: 'Apprentissage profond',       niveauRequis: 'AVANCE',        poidsCritique: 2 },
    { nom: 'Communication professionnelle', niveauRequis: 'INTERMEDIAIRE', poidsCritique: 2 },
  ],
}

async function main() {
  console.log('Seed — Intelligence Artificielle en Informatique (IAI)\n')

  // ── Vérification du programme ────────────────────────────
  const programme = await prisma.program.findUnique({
    where: { code: PROGRAMME_CODE },
  })
  if (!programme) {
    console.error(`Programme introuvable : ${PROGRAMME_CODE}`)
    console.error('Lance d\'abord seed-departements.js puis seed-programmes.js')
    process.exit(1)
  }

  // ── ÉTAPE 1 : Compétences ─────────────────────────────────
  console.log('--- Catalogue des compétences ---')
  const skillMap = {}

  for (const skill of SKILLS) {
    const existing = await prisma.skill.findUnique({ where: { nom: skill.nom } })
    if (existing) {
      console.log(`Déjà existant : ${skill.nom}`)
      skillMap[skill.nom] = existing.id
    } else {
      const created = await prisma.skill.create({ data: skill })
      console.log(`Inséré        : ${skill.nom}`)
      skillMap[skill.nom] = created.id
    }
  }

  // ── ÉTAPE 2 : Cours ───────────────────────────────────────
  console.log('\n--- Cours du programme IAI ---')
  let coursInseres = 0
  let coursIgnores = 0

  for (const c of COURS) {
    const existing = await prisma.course.findUnique({ where: { code: c.code } })

    if (existing) {
      // Lier au programme IAI si pas encore fait
      await prisma.course.update({
        where: { code: c.code },
        data: { programs: { connect: { id: programme.id } } },
      })
      console.log(`Déjà existant (lié) : ${c.code} — ${c.nom}`)
      coursIgnores++
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
      coursInseres++
    }
  }

  // ── ÉTAPE 3 : Liens cours → compétences ──────────────────
  console.log('\n--- Liens cours → compétences ---')
  let liensInseres = 0
  let liensIgnores = 0

  for (const [codeCours, competences] of Object.entries(COURS_SKILLS)) {
    const cours = await prisma.course.findUnique({ where: { code: codeCours } })

    if (!cours) {
      console.log(`Cours introuvable : ${codeCours}`)
      continue
    }

    for (const comp of competences) {
      const skillId = skillMap[comp.nom]
      if (!skillId) {
        console.log(`Compétence introuvable : ${comp.nom}`)
        continue
      }

      const existing = await prisma.courseSkill.findUnique({
        where: { courseId_skillId: { courseId: cours.id, skillId } },
      })

      if (existing) {
        console.log(`Déjà lié : [${codeCours}] → ${comp.nom}`)
        liensIgnores++
      } else {
        await prisma.courseSkill.create({
          data: {
            courseId:      cours.id,
            skillId,
            niveauRequis:  comp.niveauRequis,
            poidsCritique: comp.poidsCritique,
          },
        })
        console.log(`Lié : [${codeCours}] → ${comp.nom} (${comp.niveauRequis} / poids: ${comp.poidsCritique})`)
        liensInseres++
      }
    }
  }

  console.log(`\n══════════════════════════════`)
  console.log(`Résumé — Programme : ${PROGRAMME_CODE}`)
  console.log(`  Cours insérés    : ${coursInseres}`)
  console.log(`  Cours ignorés    : ${coursIgnores}`)
  console.log(`  Liens insérés    : ${liensInseres}`)
  console.log(`  Liens ignorés    : ${liensIgnores}`)
  console.log(`══════════════════════════════`)
}

main()
  .catch((e) => {
    console.error('Erreur lors du seed :', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })