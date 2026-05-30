import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg }    from '@prisma/adapter-pg'
import 'dotenv/config'

const adapter = new PrismaPg(process.env.DATABASE_URL)
const prisma  = new PrismaClient({ adapter })

// ─────────────────────────────────────────────────────────────
// CATALOGUE GLOBAL DES COMPÉTENCES
// Chaque compétence a un nom unique, une catégorie et description
// ─────────────────────────────────────────────────────────────
const SKILLS = [
  // PROGRAMMATION
  { nom: 'Python',                    categorie: 'Programmation',      description: 'Langage de programmation généraliste et IA' },
  { nom: 'Java',                      categorie: 'Programmation',      description: 'Programmation orientée objet et applications d\'entreprise' },
  { nom: 'C#',                        categorie: 'Programmation',      description: 'Développement .NET et applications de bureau Windows' },
  { nom: 'JavaScript',                categorie: 'Programmation',      description: 'Langage du Web client et serveur (Node.js)' },
  { nom: 'TypeScript',                categorie: 'Programmation',      description: 'Superset typé de JavaScript' },
  { nom: 'Swift',                     categorie: 'Programmation',      description: 'Développement d\'applications iOS/macOS' },
  { nom: 'Kotlin',                    categorie: 'Programmation',      description: 'Développement d\'applications Android' },
  { nom: 'Programmation orientée objet', categorie: 'Programmation',   description: 'Concepts POO : classes, héritage, polymorphisme, encapsulation' },
  { nom: 'Structures de données',     categorie: 'Programmation',      description: 'Listes, arbres, graphes, piles, files' },
  { nom: 'Algorithmes',               categorie: 'Programmation',      description: 'Conception et analyse d\'algorithmes' },
  { nom: 'Patrons de conception',     categorie: 'Programmation',      description: 'Design patterns : MVC, Singleton, Factory, Observer, etc.' },

  // WEB
  { nom: 'HTML/CSS',                  categorie: 'Développement Web',  description: 'Structure et style des pages Web' },
  { nom: 'React',                     categorie: 'Développement Web',  description: 'Framework JavaScript pour interfaces utilisateur' },
  { nom: 'Next.js',                   categorie: 'Développement Web',  description: 'Framework React fullstack avec SSR' },
  { nom: 'Node.js',                   categorie: 'Développement Web',  description: 'Environnement d\'exécution JavaScript côté serveur' },
  { nom: 'API REST',                  categorie: 'Développement Web',  description: 'Conception et consommation d\'API RESTful' },
  { nom: 'Programmation Web avancée', categorie: 'Développement Web',  description: 'Techniques avancées : WebSockets, authentification, sécurité Web' },

  // MOBILE
  { nom: 'Développement Android',     categorie: 'Développement Mobile', description: 'Applications Android avec Kotlin/Java et Android Studio' },
  { nom: 'Développement iOS',         categorie: 'Développement Mobile', description: 'Applications iOS avec Swift et Xcode' },

  // BASE DE DONNÉES
  { nom: 'SQL',                       categorie: 'Base de données',    description: 'Requêtes SQL : SELECT, JOIN, transactions, indexation' },
  { nom: 'PostgreSQL',                categorie: 'Base de données',    description: 'Système de gestion de base de données relationnelle' },
  { nom: 'MongoDB',                   categorie: 'Base de données',    description: 'Base de données NoSQL orientée documents' },
  { nom: 'Modélisation de données',   categorie: 'Base de données',    description: 'MCD, MLD, normalisation, conception de schémas' },
  { nom: 'Administration BD',         categorie: 'Base de données',    description: 'Optimisation, sauvegardes, gestion des accès et performances' },

  // SYSTÈMES ET RÉSEAUX
  { nom: 'Linux',                     categorie: 'Systèmes',           description: 'Administration et commandes Linux/Unix' },
  { nom: 'Réseaux informatiques',     categorie: 'Systèmes',           description: 'Protocoles TCP/IP, DNS, HTTP, configuration réseau' },
  { nom: 'Architecture informatique', categorie: 'Systèmes',           description: 'Composants matériels, mémoire, CPU, systèmes d\'exploitation' },

  // CYBERSÉCURITÉ
  { nom: 'Cybersécurité',             categorie: 'Sécurité',           description: 'Principes de sécurité : chiffrement, authentification, vulnérabilités' },

  // QUALITÉ ET TESTS
  { nom: 'Tests logiciels',           categorie: 'Qualité',            description: 'Tests unitaires, d\'intégration, TDD, outils de tests automatisés' },
  { nom: 'Assurance qualité',         categorie: 'Qualité',            description: 'Processus QA, revue de code, métriques de qualité' },

  // GÉNIE LOGICIEL
  { nom: 'Analyse et conception',     categorie: 'Génie logiciel',     description: 'UML, diagrammes de cas d\'utilisation, architecture logicielle' },
  { nom: 'Gestion de projet logiciel',categorie: 'Génie logiciel',     description: 'Méthodologies Agile, Scrum, gestion des exigences' },

  // MATHÉMATIQUES
  { nom: 'Algèbre',                   categorie: 'Mathématiques',      description: 'Algèbre linéaire et structures algébriques' },
  { nom: 'Statistiques',              categorie: 'Mathématiques',      description: 'Statistiques descriptives et inférentielles, probabilités' },

  // INTELLIGENCE ARTIFICIELLE
  { nom: 'Intelligence artificielle', categorie: 'IA & Données',       description: 'Concepts IA : apprentissage automatique, réseaux de neurones, NLP' },
]

// ─────────────────────────────────────────────────────────────
// MAPPING COURS → COMPÉTENCES REQUISES
// niveauRequis : DEBUTANT | INTERMEDIAIRE | AVANCE
// poidsCritique : 1 (secondaire) → 3 (essentiel)
// ─────────────────────────────────────────────────────────────
const COURS_SKILLS = {

  // ── ÉTAPE 1 ──────────────────────────────────────────────
  '030733-IFM': [ // Introduction à la programmation
    { nom: 'Python',                    niveauRequis: 'DEBUTANT',      poidsCritique: 3 },
    { nom: 'Algorithmes',               niveauRequis: 'DEBUTANT',      poidsCritique: 3 },
    { nom: 'Structures de données',     niveauRequis: 'DEBUTANT',      poidsCritique: 2 },
  ],
  '025747-IFM': [ // Algèbre et trigonométrie
    { nom: 'Algèbre',                   niveauRequis: 'DEBUTANT',      poidsCritique: 3 },
    { nom: 'Statistiques',              niveauRequis: 'DEBUTANT',      poidsCritique: 1 },
  ],
  '025748-IFM': [ // Introduction à la gestion d'un système d'exploitation
    { nom: 'Linux',                     niveauRequis: 'DEBUTANT',      poidsCritique: 3 },
    { nom: 'Architecture informatique', niveauRequis: 'DEBUTANT',      poidsCritique: 2 },
  ],
  '030832-IFM': [ // Réseau pour programmeur
    { nom: 'Réseaux informatiques',     niveauRequis: 'DEBUTANT',      poidsCritique: 3 },
    { nom: 'Linux',                     niveauRequis: 'DEBUTANT',      poidsCritique: 1 },
  ],
  '030834-IFM': [ // Architecture de l'ordinateur pour programmeur
    { nom: 'Architecture informatique', niveauRequis: 'DEBUTANT',      poidsCritique: 3 },
    { nom: 'Linux',                     niveauRequis: 'DEBUTANT',      poidsCritique: 2 },
  ],

  // ── ÉTAPE 2 ──────────────────────────────────────────────
  '025906-IFM': [ // Introduction aux bases de données
    { nom: 'SQL',                       niveauRequis: 'DEBUTANT',      poidsCritique: 3 },
    { nom: 'Modélisation de données',   niveauRequis: 'DEBUTANT',      poidsCritique: 3 },
    { nom: 'PostgreSQL',                niveauRequis: 'DEBUTANT',      poidsCritique: 2 },
  ],
  '025769-IFM': [ // Statistiques
    { nom: 'Statistiques',              niveauRequis: 'INTERMEDIAIRE',  poidsCritique: 3 },
    { nom: 'Algèbre',                   niveauRequis: 'DEBUTANT',      poidsCritique: 1 },
  ],
  '025909-IFM': [ // Introduction à la programmation Web client
    { nom: 'HTML/CSS',                  niveauRequis: 'DEBUTANT',      poidsCritique: 3 },
    { nom: 'JavaScript',                niveauRequis: 'DEBUTANT',      poidsCritique: 3 },
  ],
  '025907-IFM': [ // Développement d'applications mobiles pour Android
    { nom: 'Développement Android',     niveauRequis: 'DEBUTANT',      poidsCritique: 3 },
    { nom: 'Kotlin',                    niveauRequis: 'DEBUTANT',      poidsCritique: 3 },
    { nom: 'Java',                      niveauRequis: 'DEBUTANT',      poidsCritique: 2 },
    { nom: 'Programmation orientée objet', niveauRequis: 'DEBUTANT',   poidsCritique: 2 },
  ],
  '025914-IFM': [ // Assurance de qualité logicielle
    { nom: 'Assurance qualité',         niveauRequis: 'DEBUTANT',      poidsCritique: 3 },
    { nom: 'Tests logiciels',           niveauRequis: 'DEBUTANT',      poidsCritique: 3 },
  ],
  '030737-IFM': [ // Programmation orientée objet
    { nom: 'Programmation orientée objet', niveauRequis: 'INTERMEDIAIRE', poidsCritique: 3 },
    { nom: 'Java',                      niveauRequis: 'INTERMEDIAIRE',  poidsCritique: 3 },
    { nom: 'Algorithmes',               niveauRequis: 'INTERMEDIAIRE',  poidsCritique: 2 },
    { nom: 'Patrons de conception',     niveauRequis: 'DEBUTANT',      poidsCritique: 1 },
  ],

  // ── ÉTAPE 3 ──────────────────────────────────────────────
  '029990-IFM': [ // Introduction à la programmation de serveurs Web
    { nom: 'Node.js',                   niveauRequis: 'DEBUTANT',      poidsCritique: 3 },
    { nom: 'API REST',                  niveauRequis: 'DEBUTANT',      poidsCritique: 3 },
    { nom: 'JavaScript',                niveauRequis: 'INTERMEDIAIRE',  poidsCritique: 2 },
    { nom: 'SQL',                       niveauRequis: 'DEBUTANT',      poidsCritique: 1 },
  ],
  '025797-IFM': [ // Fondements de la cybersécurité
    { nom: 'Cybersécurité',             niveauRequis: 'DEBUTANT',      poidsCritique: 3 },
    { nom: 'Réseaux informatiques',     niveauRequis: 'INTERMEDIAIRE',  poidsCritique: 2 },
    { nom: 'Linux',                     niveauRequis: 'INTERMEDIAIRE',  poidsCritique: 1 },
  ],
  '030739-IFM': [ // Développement d'application de bureau
    { nom: 'C#',                        niveauRequis: 'INTERMEDIAIRE',  poidsCritique: 3 },
    { nom: 'Programmation orientée objet', niveauRequis: 'INTERMEDIAIRE', poidsCritique: 3 },
    { nom: 'Patrons de conception',     niveauRequis: 'DEBUTANT',      poidsCritique: 2 },
  ],
  '030742-IFM': [ // Analyse et conception de systèmes
    { nom: 'Analyse et conception',     niveauRequis: 'INTERMEDIAIRE',  poidsCritique: 3 },
    { nom: 'Gestion de projet logiciel',niveauRequis: 'DEBUTANT',      poidsCritique: 2 },
    { nom: 'Modélisation de données',   niveauRequis: 'INTERMEDIAIRE',  poidsCritique: 2 },
  ],
  '030746-IFM': [ // Bases de données relationnelles avancées
    { nom: 'SQL',                       niveauRequis: 'AVANCE',        poidsCritique: 3 },
    { nom: 'PostgreSQL',                niveauRequis: 'INTERMEDIAIRE',  poidsCritique: 3 },
    { nom: 'Administration BD',         niveauRequis: 'DEBUTANT',      poidsCritique: 2 },
    { nom: 'Modélisation de données',   niveauRequis: 'INTERMEDIAIRE',  poidsCritique: 2 },
  ],
  '025913-IFM': [ // Tests logiciels
    { nom: 'Tests logiciels',           niveauRequis: 'INTERMEDIAIRE',  poidsCritique: 3 },
    { nom: 'Assurance qualité',         niveauRequis: 'INTERMEDIAIRE',  poidsCritique: 3 },
    { nom: 'Programmation orientée objet', niveauRequis: 'INTERMEDIAIRE', poidsCritique: 1 },
  ],
  '029983-IFM': [ // Structures de données appliquées
    { nom: 'Structures de données',     niveauRequis: 'INTERMEDIAIRE',  poidsCritique: 3 },
    { nom: 'Algorithmes',               niveauRequis: 'INTERMEDIAIRE',  poidsCritique: 3 },
    { nom: 'Java',                      niveauRequis: 'INTERMEDIAIRE',  poidsCritique: 2 },
  ],

  // ── ÉTAPE 4 ──────────────────────────────────────────────
  '025921-IFM': [ // Développement d'applications mobiles pour iOS
    { nom: 'Développement iOS',         niveauRequis: 'INTERMEDIAIRE',  poidsCritique: 3 },
    { nom: 'Swift',                     niveauRequis: 'INTERMEDIAIRE',  poidsCritique: 3 },
    { nom: 'Programmation orientée objet', niveauRequis: 'INTERMEDIAIRE', poidsCritique: 2 },
  ],
  '029991-IFM': [ // Programmation Web avancé
    { nom: 'Programmation Web avancée', niveauRequis: 'AVANCE',        poidsCritique: 3 },
    { nom: 'JavaScript',                niveauRequis: 'AVANCE',        poidsCritique: 3 },
    { nom: 'TypeScript',                niveauRequis: 'INTERMEDIAIRE',  poidsCritique: 3 },
    { nom: 'React',                     niveauRequis: 'INTERMEDIAIRE',  poidsCritique: 2 },
    { nom: 'Node.js',                   niveauRequis: 'INTERMEDIAIRE',  poidsCritique: 2 },
    { nom: 'API REST',                  niveauRequis: 'AVANCE',        poidsCritique: 2 },
  ],
  '026035-IFM': [ // Systèmes de gestion de bases de données
    { nom: 'Administration BD',         niveauRequis: 'AVANCE',        poidsCritique: 3 },
    { nom: 'PostgreSQL',                niveauRequis: 'AVANCE',        poidsCritique: 3 },
    { nom: 'MongoDB',                   niveauRequis: 'INTERMEDIAIRE',  poidsCritique: 2 },
    { nom: 'SQL',                       niveauRequis: 'AVANCE',        poidsCritique: 3 },
  ],
  '030747-IFM': [ // Projet intégrateur
    { nom: 'Gestion de projet logiciel',niveauRequis: 'INTERMEDIAIRE',  poidsCritique: 3 },
    { nom: 'Analyse et conception',     niveauRequis: 'AVANCE',        poidsCritique: 3 },
    { nom: 'API REST',                  niveauRequis: 'INTERMEDIAIRE',  poidsCritique: 2 },
    { nom: 'Tests logiciels',           niveauRequis: 'INTERMEDIAIRE',  poidsCritique: 2 },
    { nom: 'SQL',                       niveauRequis: 'INTERMEDIAIRE',  poidsCritique: 1 },
  ],
  '030505-IFM': [ // Initiation à l'intelligence artificielle
    { nom: 'Intelligence artificielle', niveauRequis: 'DEBUTANT',      poidsCritique: 3 },
    { nom: 'Python',                    niveauRequis: 'INTERMEDIAIRE',  poidsCritique: 3 },
    { nom: 'Statistiques',              niveauRequis: 'INTERMEDIAIRE',  poidsCritique: 2 },
    { nom: 'Algorithmes',               niveauRequis: 'INTERMEDIAIRE',  poidsCritique: 2 },
  ],
  '025922-IFM': [ // Patrons de conception
    { nom: 'Patrons de conception',     niveauRequis: 'AVANCE',        poidsCritique: 3 },
    { nom: 'Programmation orientée objet', niveauRequis: 'AVANCE',     poidsCritique: 3 },
    { nom: 'Analyse et conception',     niveauRequis: 'INTERMEDIAIRE',  poidsCritique: 2 },
    { nom: 'Java',                      niveauRequis: 'AVANCE',        poidsCritique: 1 },
  ],
}

async function main() {
  console.log('Insertion des compétences et liens cours→compétences (PI)\n')

  // ── ÉTAPE 1 : Insérer toutes les compétences ──────────────
  console.log('--- Catalogue des compétences ---')
  const skillMap = {} // nom → id

  for (const skill of SKILLS) {
    const existing = await prisma.skill.findUnique({
      where: { nom: skill.nom },
    })

    if (existing) {
      console.log(`Déjà existant : ${skill.nom}`)
      skillMap[skill.nom] = existing.id
    } else {
      const created = await prisma.skill.create({ data: skill })
      console.log(`Inséré        : ${skill.nom}`)
      skillMap[skill.nom] = created.id
    }
  }

  // ── ÉTAPE 2 : Lier chaque cours à ses compétences ─────────
  console.log('\n--- Liens cours → compétences ---')
  let liensInseres = 0
  let liensIgnores = 0

  for (const [codeCours, competences] of Object.entries(COURS_SKILLS)) {
    const cours = await prisma.course.findUnique({
      where: { code: codeCours },
    })

    if (!cours) {
      console.log(`Cours introuvable : ${codeCours} — lance d'abord seed-cours-PI.js`)
      continue
    }

    for (const comp of competences) {
      const skillId = skillMap[comp.nom]

      if (!skillId) {
        console.log(`Compétence introuvable : ${comp.nom}`)
        continue
      }

      const existing = await prisma.courseSkill.findUnique({
        where: {
          courseId_skillId: {
            courseId: cours.id,
            skillId,
          },
        },
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
        console.log(`Lié      : [${codeCours}] → ${comp.nom} (niveau: ${comp.niveauRequis}, poids: ${comp.poidsCritique})`)
        liensInseres++
      }
    }
  }

  console.log(`\nRésumé compétences :`)
  console.log(`   Dans le catalogue : ${SKILLS.length}`)
  console.log(`\nRésumé liens cours→compétences :`)
  console.log(`   Insérés  : ${liensInseres}`)
  console.log(`   Ignorés  : ${liensIgnores}`)
}

main()
  .catch((e) => {
    console.error('Erreur lors du seed :', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })