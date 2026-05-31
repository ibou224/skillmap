import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg }    from '@prisma/adapter-pg'
import 'dotenv/config'

const adapter = new PrismaPg(process.env.DATABASE_URL)
const prisma  = new PrismaClient({ adapter })

// ─────────────────────────────────────────────────────────────
// BACKFILL — Ajoute des compétences aux cours qui n'en ont AUCUNE
//
// Le script parcourt toute la table Course, repère les cours sans
// compétence (courseSkills vide), déduit des compétences pertinentes
// à partir du nom du cours (et adapte le niveau à l'étape), crée en
// base les compétences manquantes, puis crée les liens cours→compétence.
//
// Idempotent : un cours qui a déjà des compétences est ignoré, et les
// liens déjà présents ne sont jamais dupliqués.
// ─────────────────────────────────────────────────────────────

// Catalogue de référence (nom → catégorie/description) pour créer
// proprement une compétence si elle n'existe pas encore en base.
const SKILL_CATALOGUE = {
  // Programmation
  'Python':                       { categorie: 'Programmation',            description: 'Langage de programmation généraliste et IA' },
  'Java':                         { categorie: 'Programmation',            description: 'Programmation orientée objet et applications d\'entreprise' },
  'C#':                           { categorie: 'Programmation',            description: 'Développement .NET et applications de bureau Windows' },
  'JavaScript':                   { categorie: 'Programmation',            description: 'Langage du Web client et serveur (Node.js)' },
  'Programmation orientée objet': { categorie: 'Programmation',            description: 'Concepts POO : classes, héritage, polymorphisme, encapsulation' },
  'Structures de données':        { categorie: 'Programmation',            description: 'Listes, arbres, graphes, piles, files' },
  'Algorithmes':                  { categorie: 'Programmation',            description: 'Conception et analyse d\'algorithmes' },
  'Patrons de conception':        { categorie: 'Programmation',            description: 'Design patterns : MVC, Singleton, Factory, Observer, etc.' },
  // Web
  'HTML/CSS':                     { categorie: 'Développement Web',        description: 'Structure et style des pages Web' },
  'React':                        { categorie: 'Développement Web',        description: 'Framework JavaScript pour interfaces utilisateur' },
  'Node.js':                      { categorie: 'Développement Web',        description: 'Environnement d\'exécution JavaScript côté serveur' },
  'API REST':                     { categorie: 'Développement Web',        description: 'Conception et consommation d\'API RESTful' },
  'Programmation Web avancée':    { categorie: 'Développement Web',        description: 'Techniques avancées : WebSockets, authentification, sécurité Web' },
  // Mobile
  'Développement Android':        { categorie: 'Développement Mobile',     description: 'Applications Android avec Kotlin/Java et Android Studio' },
  'Développement iOS':            { categorie: 'Développement Mobile',     description: 'Applications iOS avec Swift et Xcode' },
  // Base de données
  'SQL':                          { categorie: 'Base de données',          description: 'Requêtes SQL : SELECT, JOIN, transactions, indexation' },
  'PostgreSQL':                   { categorie: 'Base de données',          description: 'Système de gestion de base de données relationnelle' },
  'Modélisation de données':      { categorie: 'Base de données',          description: 'MCD, MLD, normalisation, conception de schémas' },
  'Administration BD':            { categorie: 'Base de données',          description: 'Optimisation, sauvegardes, gestion des accès et performances' },
  // Systèmes / réseaux / sécurité
  'Linux':                        { categorie: 'Systèmes',                 description: 'Administration et commandes Linux/Unix' },
  'Réseaux informatiques':        { categorie: 'Systèmes',                 description: 'Protocoles TCP/IP, DNS, HTTP, configuration réseau' },
  'Architecture informatique':    { categorie: 'Systèmes',                 description: 'Composants matériels, mémoire, CPU, systèmes d\'exploitation' },
  'Cybersécurité':                { categorie: 'Sécurité',                 description: 'Principes de sécurité : chiffrement, authentification, vulnérabilités' },
  // Qualité / génie logiciel
  'Tests logiciels':              { categorie: 'Qualité',                  description: 'Tests unitaires, d\'intégration, TDD, outils de tests automatisés' },
  'Assurance qualité':            { categorie: 'Qualité',                  description: 'Processus QA, revue de code, métriques de qualité' },
  'Analyse et conception':        { categorie: 'Génie logiciel',           description: 'UML, diagrammes de cas d\'utilisation, architecture logicielle' },
  'Gestion de projet logiciel':   { categorie: 'Génie logiciel',           description: 'Méthodologies Agile, Scrum, gestion des exigences' },
  // Maths / IA
  'Algèbre':                      { categorie: 'Mathématiques',            description: 'Algèbre linéaire et structures algébriques' },
  'Statistiques':                 { categorie: 'Mathématiques',            description: 'Statistiques descriptives et inférentielles, probabilités' },
  'Intelligence artificielle':    { categorie: 'IA & Données',             description: 'Concepts IA : apprentissage automatique, réseaux de neurones, NLP' },
  // Transversales / formation générale
  'Communication professionnelle': { categorie: 'Compétences transversales', description: 'Communication écrite et orale en contexte professionnel' },
  'Rédaction et communication écrite': { categorie: 'Compétences transversales', description: 'Rédaction, structuration et clarté des écrits' },
  'Anglais professionnel':        { categorie: 'Langues',                  description: 'Anglais appliqué au contexte professionnel et technique' },
  'Pensée critique':              { categorie: 'Compétences transversales', description: 'Analyse, argumentation et raisonnement logique' },
  'Éthique professionnelle':      { categorie: 'Compétences transversales', description: 'Déontologie, responsabilité et limites professionnelles' },
  'Travail d\'équipe':            { categorie: 'Compétences transversales', description: 'Collaboration, coordination et dynamique de groupe' },
  'Santé et bien-être':           { categorie: 'Compétences transversales', description: 'Activité physique, hygiène de vie et gestion du stress' },
}

// Règles d'inférence : si le nom du cours contient l'un des mots-clés,
// on associe les compétences listées (poids 3 = principale, 2 = secondaire).
// Le niveau (DEBUTANT/INTERMEDIAIRE/AVANCE) est déduit de l'étape du cours.
const REGLES = [
  // ── Formation générale / cours communs ────────────────────
  { motsCles: ['français', 'francais', 'rédaction', 'redaction', 'écriture', 'ecriture'], skills: [['Rédaction et communication écrite', 3], ['Communication professionnelle', 2]] },
  { motsCles: ['anglais', 'english', 'esl'],                      skills: [['Anglais professionnel', 3], ['Communication professionnelle', 2]] },
  { motsCles: ['communication'],                                  skills: [['Communication professionnelle', 3]] },
  { motsCles: ['philosophie', 'philo', 'humain', 'éthique', 'ethique', 'citoyen'], skills: [['Pensée critique', 3], ['Éthique professionnelle', 2]] },
  { motsCles: ['éducation physique', 'education physique', 'activité physique', 'activite physique', 'sport', 'santé', 'sante'], skills: [['Santé et bien-être', 3], ['Travail d\'équipe', 2]] },

  // ── Filière technique (au cas où un cours technique n'aurait pas de skills) ──
  { motsCles: ['intelligence artificielle', ' ia ', 'ia)', "l'ia", 'machine learning', 'apprentissage'], skills: [['Intelligence artificielle', 3], ['Python', 2]] },
  { motsCles: ['base de données', 'bases de données', 'base de donnees', 'bdd', 'sgbd'], skills: [['SQL', 3], ['Modélisation de données', 2]] },
  { motsCles: ['web'],                                            skills: [['HTML/CSS', 3], ['JavaScript', 2]] },
  { motsCles: ['serveur', 'api', 'backend'],                      skills: [['Node.js', 3], ['API REST', 2]] },
  { motsCles: ['mobile', 'android'],                              skills: [['Développement Android', 3]] },
  { motsCles: ['ios'],                                            skills: [['Développement iOS', 3]] },
  { motsCles: ['réseau', 'reseau'],                               skills: [['Réseaux informatiques', 3], ['Linux', 2]] },
  { motsCles: ['architecture', 'ordinateur', 'matériel', 'materiel'], skills: [['Architecture informatique', 3]] },
  { motsCles: ['système d\'exploitation', 'systeme d\'exploitation', 'linux', 'unix'], skills: [['Linux', 3], ['Architecture informatique', 2]] },
  { motsCles: ['cybersécurité', 'cybersecurite', 'sécurité', 'securite'], skills: [['Cybersécurité', 3], ['Réseaux informatiques', 2]] },
  { motsCles: ['test', 'qualité', 'qualite'],                     skills: [['Tests logiciels', 3], ['Assurance qualité', 2]] },
  { motsCles: ['analyse', 'conception', 'modélisation', 'modelisation'], skills: [['Analyse et conception', 3]] },
  { motsCles: ['projet', 'intégrateur', 'integrateur', 'stage'],  skills: [['Gestion de projet logiciel', 3], ['Travail d\'équipe', 2]] },
  { motsCles: ['structure', 'algorithme'],                        skills: [['Structures de données', 3], ['Algorithmes', 2]] },
  { motsCles: ['objet', 'poo'],                                   skills: [['Programmation orientée objet', 3]] },
  { motsCles: ['patron', 'design pattern'],                       skills: [['Patrons de conception', 3], ['Programmation orientée objet', 2]] },
  { motsCles: ['statistique', 'probabilité', 'probabilite'],      skills: [['Statistiques', 3], ['Algèbre', 2]] },
  { motsCles: ['algèbre', 'algebre', 'mathématique', 'mathematique', 'trigonométrie', 'trigonometrie', 'calcul'], skills: [['Algèbre', 3]] },
  { motsCles: ['programmation', 'développement', 'developpement', 'logiciel'], skills: [['Algorithmes', 3], ['Programmation orientée objet', 2]] },
]

// Compétences par défaut si aucun mot-clé ne correspond (le cours ne reste jamais vide).
const SKILLS_PAR_DEFAUT = [['Communication professionnelle', 3], ['Pensée critique', 2]]

/** Déduit le niveau requis à partir de l'étape du cours. */
function niveauPourEtape(etape) {
  if (!etape || etape <= 2) return 'DEBUTANT'
  if (etape === 3) return 'INTERMEDIAIRE'
  return 'AVANCE'
}

/**
 * Déduit la liste des compétences (nom + poids) pertinentes pour un cours,
 * à partir des mots-clés présents dans son nom. Déduplique par nom (garde le poids max).
 */
function competencesPourCours(nom) {
  const texte = ` ${nom.toLowerCase()} `
  const parNom = new Map()

  for (const regle of REGLES) {
    if (regle.motsCles.some((mc) => texte.includes(mc))) {
      for (const [skillNom, poids] of regle.skills) {
        const actuel = parNom.get(skillNom) ?? 0
        if (poids > actuel) parNom.set(skillNom, poids)
      }
    }
  }

  if (parNom.size === 0) {
    for (const [skillNom, poids] of SKILLS_PAR_DEFAUT) parNom.set(skillNom, poids)
  }

  return [...parNom.entries()].map(([nom, poids]) => ({ nom, poids }))
}

async function main() {
  console.log('Backfill — compétences des cours sans compétence\n')

  // Cache nom → id des compétences (création paresseuse si absente).
  const skillMap = {}

  async function ensureSkill(nom) {
    if (skillMap[nom]) return skillMap[nom]
    const existing = await prisma.skill.findUnique({ where: { nom } })
    if (existing) {
      skillMap[nom] = existing.id
      return existing.id
    }
    const meta = SKILL_CATALOGUE[nom] ?? { categorie: 'Compétences transversales', description: '' }
    const created = await prisma.skill.create({ data: { nom, categorie: meta.categorie, description: meta.description } })
    console.log(`Compétence créée en base : ${nom}`)
    skillMap[nom] = created.id
    return created.id
  }

  // Parcourt TOUS les cours avec le compte de leurs compétences.
  const cours = await prisma.course.findMany({
    include: { courseSkills: { select: { skillId: true } } },
    orderBy: { code: 'asc' },
  })

  const sansCompetence = cours.filter((c) => c.courseSkills.length === 0)

  console.log(`Cours en base          : ${cours.length}`)
  console.log(`Cours sans compétence  : ${sansCompetence.length}\n`)

  if (sansCompetence.length === 0) {
    console.log('Aucun cours à traiter — tous les cours ont déjà au moins une compétence.')
    return
  }

  let coursTraites  = 0
  let liensInseres  = 0

  for (const c of sansCompetence) {
    const niveau      = niveauPourEtape(c.etape)
    const competences = competencesPourCours(c.nom)

    console.log(`[${c.code}] ${c.nom} (étape ${c.etape ?? '?'}) → ${competences.map((x) => x.nom).join(', ')}`)

    for (const comp of competences) {
      const skillId = await ensureSkill(comp.nom)

      // Sécurité : ne jamais dupliquer un lien existant.
      const existing = await prisma.courseSkill.findUnique({
        where: { courseId_skillId: { courseId: c.id, skillId } },
      })
      if (existing) continue

      await prisma.courseSkill.create({
        data: {
          courseId:      c.id,
          skillId,
          niveauRequis:  niveau,
          poidsCritique: comp.poids,
        },
      })
      liensInseres++
    }
    coursTraites++
  }

  console.log(`\n══════════════════════════════════════════`)
  console.log(`Résumé`)
  console.log(`  Cours traités                  : ${coursTraites}`)
  console.log(`  Liens cours→compétence insérés : ${liensInseres}`)
  console.log(`══════════════════════════════════════════`)
}

main()
  .catch((e) => {
    console.error('Erreur lors du backfill :', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
