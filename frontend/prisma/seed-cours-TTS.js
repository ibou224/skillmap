import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg }    from '@prisma/adapter-pg'
import 'dotenv/config'

const adapter = new PrismaPg(process.env.DATABASE_URL)
const prisma  = new PrismaClient({ adapter })

const PROGRAMME_CODE = 'SSH-TTS'

// ─────────────────────────────────────────────────────────────
// COMPÉTENCES SPÉCIFIQUES — TRAVAIL SOCIAL
// ─────────────────────────────────────────────────────────────
const SKILLS = [
  { nom: 'Intervention sociale',          categorie: 'Travail social',           description: 'Techniques d\'intervention individuelle, de groupe et communautaire' },
  { nom: 'Relation d\'aide',              categorie: 'Travail social',           description: 'Écoute active, empathie, accompagnement des personnes en difficulté' },
  { nom: 'Gestion de dossiers',           categorie: 'Travail social',           description: 'Rédaction de rapports, suivi de cas, documentation professionnelle' },
  { nom: 'Gestion de crise',              categorie: 'Travail social',           description: 'Intervention en situation de crise, désescalade, plan de sécurité' },
  { nom: 'Travail social de groupe',      categorie: 'Travail social',           description: 'Animation de groupes, dynamique de groupe, intervention collective' },
  { nom: 'Protection de la jeunesse',     categorie: 'Travail social',           description: 'Législation jeunesse, signalement, intervention auprès des mineurs' },
  { nom: 'Gérontologie',                  categorie: 'Travail social',           description: 'Vieillissement, soins aux aînés, enjeux liés à la population âgée' },
  { nom: 'Santé mentale',                 categorie: 'Travail social',           description: 'Troubles mentaux, ressources communautaires, intervention psychosociale' },
  { nom: 'Dépendances',                   categorie: 'Travail social',           description: 'Toxicomanie, alcoolisme, jeu compulsif et approches d\'intervention' },
  { nom: 'Éthique professionnelle',       categorie: 'Compétences transversales', description: 'Déontologie, confidentialité, limites professionnelles' },
  { nom: 'Interculturalité',              categorie: 'Compétences transversales', description: 'Compétences culturelles, diversité, relations interculturelles' },
  { nom: 'Intégration à la profession',   categorie: 'Travail social',           description: 'Identité professionnelle, milieu de pratique, réseau de services sociaux' },
  { nom: 'Stage professionnel',           categorie: 'Travail social',           description: 'Expérience pratique supervisée en milieu de travail social' },
  // Compétences transversales déjà potentiellement existantes
  { nom: 'Communication professionnelle', categorie: 'Compétences transversales', description: 'Communication écrite et orale en contexte professionnel et d\'entreprise' },
]

// ─────────────────────────────────────────────────────────────
// COURS COMMUNS À TOUS LES PROGRAMMES (FGE / FRA / ENL)
// etape: null car ils ne sont pas liés à une étape spécifique
// ─────────────────────────────────────────────────────────────
const COURS_COMMUNS = [
  // ── FORMATION GÉNÉRALE (FGE) ──────────────────────────────
  { code: '025636-FGE', nom: 'Citoyenneté canadienne',                              etape: 0 },
  { code: '025827-FGE', nom: 'Santé, environnement et prévention des infections',   etape: 0 },
  { code: '025830-FGE', nom: 'De l\'identité à la culture',                         etape: 0 },
  { code: '025831-FGE', nom: 'Vive l\'espagnol',                                    etape: 0 },
  { code: '025833-FGE', nom: 'Réalités autochtones contemporaines',                 etape: 0 },
  { code: '025834-FGE', nom: 'La perception en psychologie',                        etape: 0 },
  { code: '025700-FGE', nom: 'Découvrir l\'éthique appliquée : comment décider ?',  etape: 0 },
  { code: '027192-FGE', nom: 'Le bonheur : nourrir, équilibrer et renforcer votre qualité de vie', etape: 0 },
  { code: '028230-FGE', nom: 'La compassion',                                       etape: 0 },
  { code: '029848-FGE', nom: 'La résilience',                                       etape: 0 },
  { code: '030018-FGE', nom: 'Équité, diversité, inclusivité',                      etape: 0 },
  { code: '025636-FGE-EM', nom: 'Exploration des métiers',                          etape: 0 },

  // ── FRANÇAIS (FRA) ───────────────────────────────────────
  { code: '032308-FRA', nom: 'Stratégies de communication en milieu professionnel', etape: 0 },
  { code: '032313-FRA', nom: 'Communication orale en milieu professionnel',         etape: 0 },
  { code: '032317-FRA', nom: 'Communication écrite en milieu professionnel',        etape: 0 },

  // ── ANGLAIS (ENL) ────────────────────────────────────────
  { code: '026883-ENL', nom: 'Foundations of English',                              etape: 0 },
  { code: '029990-ENL', nom: 'Oral Communication: Beginner Level',                  etape: 0 },
  { code: '029992-ENL', nom: 'Oral Communication: Intermediate Level',              etape: 0 },
  { code: '029999-ENL', nom: 'Written Communication: Beginner Level',               etape: 0 },
  { code: '029941-ENL', nom: 'Written Communication: Intermediate Level',           etape: 0 },
]

// ─────────────────────────────────────────────────────────────
// COURS OBLIGATOIRES — TRAVAIL SOCIAL (SSH-TTS)
// ─────────────────────────────────────────────────────────────
const COURS_TTS = [
  // ── ÉTAPE 1 ──────────────────────────────────────────────
  { code: '024340-SSC', nom: 'Introduction au travail social',     etape: 1 },
  { code: '024352-SSC', nom: 'Relation d\'aide',                   etape: 1 },
  { code: '024358-SSC', nom: 'Initiation à la profession',         etape: 1 },
  { code: '026945-SSC', nom: 'Enfance et adolescence',             etape: 1 },
  { code: '024360-SSC', nom: 'Relations interculturelles',         etape: 1 },

  // ── ÉTAPE 2 ──────────────────────────────────────────────
  { code: '026327-STG', nom: 'Stage d\'exploration de la profession', etape: 2 },
  { code: '024354-SSC', nom: 'Enjeux sociaux et personnes vulnérables', etape: 2 },
  { code: '024371-SSC', nom: 'Conscientisation à la gérontologie',  etape: 2 },
  { code: '030333-SSC', nom: 'Santé mentale et dépendances',        etape: 2 },
  { code: '024368-SSC', nom: 'Travail social de groupe',            etape: 2 },

  // ── ÉTAPE 3 ──────────────────────────────────────────────
  { code: '024362-SSC', nom: 'Problématique de la violence',        etape: 3 },
  { code: '024373-SSC', nom: 'Gestion de dossiers',                 etape: 3 },
  { code: '024375-SSC', nom: 'Monde adulte',                        etape: 3 },
  { code: '024348-SSC', nom: 'Gestion de crise',                    etape: 3 },
  { code: '030336-SSC', nom: 'Intégration de la profession',        etape: 3 },
  { code: '030328-SSC', nom: 'Pratiques et interventions en travail social', etape: 3 },
]

// ─────────────────────────────────────────────────────────────
// MAPPING COURS → COMPÉTENCES (Travail Social uniquement)
// ─────────────────────────────────────────────────────────────
const COURS_SKILLS = {
  '024340-SSC': [
    { nom: 'Intervention sociale',        niveauRequis: 'DEBUTANT',      poidsCritique: 3 },
    { nom: 'Éthique professionnelle',     niveauRequis: 'DEBUTANT',      poidsCritique: 2 },
  ],
  '024352-SSC': [
    { nom: 'Relation d\'aide',            niveauRequis: 'DEBUTANT',      poidsCritique: 3 },
    { nom: 'Santé mentale',               niveauRequis: 'DEBUTANT',      poidsCritique: 2 },
  ],
  '024358-SSC': [
    { nom: 'Intégration à la profession', niveauRequis: 'DEBUTANT',      poidsCritique: 3 },
    { nom: 'Éthique professionnelle',     niveauRequis: 'DEBUTANT',      poidsCritique: 2 },
  ],
  '026945-SSC': [
    { nom: 'Protection de la jeunesse',   niveauRequis: 'DEBUTANT',      poidsCritique: 3 },
    { nom: 'Intervention sociale',        niveauRequis: 'DEBUTANT',      poidsCritique: 2 },
  ],
  '024360-SSC': [
    { nom: 'Interculturalité',            niveauRequis: 'DEBUTANT',      poidsCritique: 3 },
    { nom: 'Communication professionnelle', niveauRequis: 'DEBUTANT',    poidsCritique: 2 },
  ],
  '026327-STG': [
    { nom: 'Stage professionnel',         niveauRequis: 'DEBUTANT',      poidsCritique: 3 },
    { nom: 'Intervention sociale',        niveauRequis: 'DEBUTANT',      poidsCritique: 3 },
    { nom: 'Éthique professionnelle',     niveauRequis: 'DEBUTANT',      poidsCritique: 2 },
  ],
  '024354-SSC': [
    { nom: 'Intervention sociale',        niveauRequis: 'INTERMEDIAIRE', poidsCritique: 3 },
    { nom: 'Santé mentale',               niveauRequis: 'DEBUTANT',      poidsCritique: 2 },
    { nom: 'Interculturalité',            niveauRequis: 'INTERMEDIAIRE', poidsCritique: 2 },
  ],
  '024371-SSC': [
    { nom: 'Gérontologie',                niveauRequis: 'INTERMEDIAIRE', poidsCritique: 3 },
    { nom: 'Relation d\'aide',            niveauRequis: 'INTERMEDIAIRE', poidsCritique: 2 },
  ],
  '030333-SSC': [
    { nom: 'Santé mentale',               niveauRequis: 'INTERMEDIAIRE', poidsCritique: 3 },
    { nom: 'Dépendances',                 niveauRequis: 'INTERMEDIAIRE', poidsCritique: 3 },
    { nom: 'Intervention sociale',        niveauRequis: 'INTERMEDIAIRE', poidsCritique: 2 },
  ],
  '024368-SSC': [
    { nom: 'Travail social de groupe',    niveauRequis: 'INTERMEDIAIRE', poidsCritique: 3 },
    { nom: 'Intervention sociale',        niveauRequis: 'INTERMEDIAIRE', poidsCritique: 2 },
  ],
  '024362-SSC': [
    { nom: 'Gestion de crise',            niveauRequis: 'INTERMEDIAIRE', poidsCritique: 3 },
    { nom: 'Intervention sociale',        niveauRequis: 'INTERMEDIAIRE', poidsCritique: 2 },
    { nom: 'Santé mentale',               niveauRequis: 'INTERMEDIAIRE', poidsCritique: 2 },
  ],
  '024373-SSC': [
    { nom: 'Gestion de dossiers',         niveauRequis: 'INTERMEDIAIRE', poidsCritique: 3 },
    { nom: 'Communication professionnelle', niveauRequis: 'INTERMEDIAIRE', poidsCritique: 2 },
    { nom: 'Éthique professionnelle',     niveauRequis: 'INTERMEDIAIRE', poidsCritique: 2 },
  ],
  '024375-SSC': [
    { nom: 'Intervention sociale',        niveauRequis: 'INTERMEDIAIRE', poidsCritique: 3 },
    { nom: 'Gérontologie',                niveauRequis: 'DEBUTANT',      poidsCritique: 2 },
  ],
  '024348-SSC': [
    { nom: 'Gestion de crise',            niveauRequis: 'AVANCE',        poidsCritique: 3 },
    { nom: 'Relation d\'aide',            niveauRequis: 'AVANCE',        poidsCritique: 3 },
    { nom: 'Santé mentale',               niveauRequis: 'INTERMEDIAIRE', poidsCritique: 2 },
  ],
  '030336-SSC': [
    { nom: 'Intégration à la profession', niveauRequis: 'AVANCE',        poidsCritique: 3 },
    { nom: 'Éthique professionnelle',     niveauRequis: 'AVANCE',        poidsCritique: 3 },
    { nom: 'Communication professionnelle', niveauRequis: 'AVANCE',      poidsCritique: 2 },
  ],
  '030328-SSC': [
    { nom: 'Intervention sociale',        niveauRequis: 'AVANCE',        poidsCritique: 3 },
    { nom: 'Travail social de groupe',    niveauRequis: 'AVANCE',        poidsCritique: 2 },
    { nom: 'Gestion de dossiers',         niveauRequis: 'AVANCE',        poidsCritique: 2 },
    { nom: 'Éthique professionnelle',     niveauRequis: 'AVANCE',        poidsCritique: 2 },
  ],
}

// ─────────────────────────────────────────────────────────────
// HELPER — upsert un cours et le lier à un ou plusieurs programmes
// ─────────────────────────────────────────────────────────────
async function upsertCours(cours, programmeIds) {
  const existing = await prisma.course.findUnique({ where: { code: cours.code } })

  if (existing) {
    await prisma.course.update({
      where: { code: cours.code },
      data: { programs: { connect: programmeIds.map(id => ({ id })) } },
    })
    return { action: 'lié', id: existing.id }
  } else {
    const created = await prisma.course.create({
      data: {
        code:     cours.code,
        nom:      cours.nom,
        etape:    cours.etape,
        programs: { connect: programmeIds.map(id => ({ id })) },
      },
    })
    return { action: 'inséré', id: created.id }
  }
}

async function main() {
  console.log('Seed — Travail Social (SSH-TTS) + Cours communs tous programmes\n')

  // ── Vérification programme principal ────────────────────
  const programme = await prisma.program.findUnique({ where: { code: PROGRAMME_CODE } })
  if (!programme) {
    console.error(`Programme introuvable : ${PROGRAMME_CODE}`)
    console.error('Lance d\'abord seed-departements.js puis seed-programmes.js')
    process.exit(1)
  }

  // ── Récupérer TOUS les programmes en BD ─────────────────
  const tousLesProgrammes = await prisma.program.findMany({ select: { id: true, code: true } })
  const tousLesIds = tousLesProgrammes.map(p => p.id)
  console.log(`${tousLesProgrammes.length} programmes trouvés en BD — les cours communs y seront tous liés.\n`)

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

  // ── ÉTAPE 2 : Cours communs → liés à TOUS les programmes ─
  console.log('\n--- Cours communs (FGE / FRA / ENL) → tous les programmes ---')
  let communsInseres = 0
  let communsLies    = 0
  const coursIdMap   = {}

  for (const c of COURS_COMMUNS) {
    const { action, id } = await upsertCours(c, tousLesIds)
    coursIdMap[c.code] = id
    if (action === 'inséré') {
      console.log(`Inséré + lié (${tousLesIds.length} prog) : ${c.code} — ${c.nom}`)
      communsInseres++
    } else {
      console.log(`Lié (${tousLesIds.length} prog)           : ${c.code} — ${c.nom}`)
      communsLies++
    }
  }

  // ── ÉTAPE 3 : Cours obligatoires Travail Social ───────────
  console.log('\n--- Cours obligatoires Travail Social ---')
  let ttsInseres = 0
  let ttsLies    = 0

  for (const c of COURS_TTS) {
    const { action, id } = await upsertCours(c, [programme.id])
    coursIdMap[c.code] = id
    if (action === 'inséré') {
      console.log(`Inséré [Étape ${c.etape}] : ${c.code} — ${c.nom}`)
      ttsInseres++
    } else {
      console.log(`Lié    [Étape ${c.etape}] : ${c.code} — ${c.nom}`)
      ttsLies++
    }
  }

  // ── ÉTAPE 4 : Liens cours → compétences ──────────────────
  console.log('\n--- Liens cours → compétences ---')
  let liensInseres = 0
  let liensIgnores = 0

  for (const [codeCours, competences] of Object.entries(COURS_SKILLS)) {
    const coursId = coursIdMap[codeCours]
    if (!coursId) {
      console.log(`Cours introuvable dans la map : ${codeCours}`)
      continue
    }

    for (const comp of competences) {
      const skillId = skillMap[comp.nom]
      if (!skillId) {
        console.log(`Compétence introuvable : ${comp.nom}`)
        continue
      }

      const existing = await prisma.courseSkill.findUnique({
        where: { courseId_skillId: { courseId: coursId, skillId } },
      })

      if (existing) {
        liensIgnores++
      } else {
        await prisma.courseSkill.create({
          data: {
            courseId:      coursId,
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

  console.log(`\n══════════════════════════════════════════`)
  console.log(`Résumé`)
  console.log(`  Cours communs insérés         : ${communsInseres}`)
  console.log(`  Cours communs liés (existants): ${communsLies}`)
  console.log(`  Cours TTS insérés             : ${ttsInseres}`)
  console.log(`  Cours TTS liés (existants)    : ${ttsLies}`)
  console.log(`  Liens cours→compétences insérés : ${liensInseres}`)
  console.log(`  Liens cours→compétences ignorés : ${liensIgnores}`)
  console.log(`══════════════════════════════════════════`)
}

main()
  .catch((e) => {
    console.error('Erreur lors du seed :', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
