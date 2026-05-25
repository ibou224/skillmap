import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg }    from '@prisma/adapter-pg'
import bcrypt          from 'bcryptjs'
import 'dotenv/config'

const adapter = new PrismaPg(process.env.DATABASE_URL)
const prisma  = new PrismaClient({ adapter })

// ── Données des 15 professeurs de test ──────────────────────────────────────

const PROFESSEURS = [
  { prenom: 'Alice',    nom: 'Tremblay',   email: 'alice.tremblay@lacitec.on.ca',   ville: 'Ottawa',     resume: 'Spécialiste en développement web et bases de données.',
    competences: [{ nom: 'React',       niveau: 'AVANCE' }, { nom: 'Node.js',    niveau: 'AVANCE' },    { nom: 'PostgreSQL', niveau: 'INTERMEDIAIRE' }],
    experiences: [{ poste: 'Développeuse fullstack', Entreprise: 'Agence Numérik', domaine: 'Web', dateDebut: new Date('2018-01-01'), dateFin: new Date('2022-06-01'), description: 'Développement d\'applications web.' }],
    formations:  [{ diplome: 'Maîtrise en informatique', niveauDiplome: 'MASTERS', etablissement: 'Université d\'Ottawa', anneeObtention: 2017 }],
  },
  { prenom: 'Bruno',    nom: 'Gagnon',     email: 'bruno.gagnon@lacitec.on.ca',     ville: 'Gatineau',   resume: 'Expert en intelligence artificielle et apprentissage automatique.',
    competences: [{ nom: 'Python',      niveau: 'AVANCE' }, { nom: 'TensorFlow', niveau: 'AVANCE' },    { nom: 'SQL',        niveau: 'INTERMEDIAIRE' }],
    experiences: [{ poste: 'Chercheur IA', Entreprise: 'Lab IA Québec', domaine: 'IA', dateDebut: new Date('2016-09-01'), dateFin: new Date('2021-08-01'), description: 'Recherche en apprentissage profond.' }],
    formations:  [{ diplome: 'Doctorat en informatique', niveauDiplome: 'DOCTORATE', etablissement: 'Université de Montréal', anneeObtention: 2016 }],
  },
  { prenom: 'Claire',   nom: 'Bouchard',   email: 'claire.bouchard@lacitec.on.ca',  ville: 'Ottawa',     resume: 'Professeure expérimentée en réseaux et sécurité informatique.',
    competences: [{ nom: 'Cisco',       niveau: 'AVANCE' }, { nom: 'Linux',      niveau: 'AVANCE' },    { nom: 'Cybersécurité', niveau: 'INTERMEDIAIRE' }],
    experiences: [{ poste: 'Administratrice réseau', Entreprise: 'GovTech Canada', domaine: 'Réseaux', dateDebut: new Date('2015-03-01'), dateFin: new Date('2020-12-01'), description: 'Gestion infrastructure réseau.' }],
    formations:  [{ diplome: 'Baccalauréat en génie réseau', niveauDiplome: 'BACHELORS', etablissement: 'Université Laval', anneeObtention: 2014 }],
  },
  { prenom: 'David',    nom: 'Leblanc',    email: 'david.leblanc@lacitec.on.ca',    ville: 'Orléans',    resume: 'Développeur Java et architecte logiciel senior.',
    competences: [{ nom: 'Java',        niveau: 'AVANCE' }, { nom: 'Spring Boot', niveau: 'AVANCE' },   { nom: 'Docker',     niveau: 'INTERMEDIAIRE' }],
    experiences: [{ poste: 'Architecte logiciel', Entreprise: 'Shopify', domaine: 'Développement', dateDebut: new Date('2017-06-01'), dateFin: null, description: 'Conception d\'architectures microservices.' }],
    formations:  [{ diplome: 'Maîtrise en génie logiciel', niveauDiplome: 'MASTERS', etablissement: 'Polytechnique Montréal', anneeObtention: 2016 }],
  },
  { prenom: 'Émilie',   nom: 'Côté',       email: 'emilie.cote@lacitec.on.ca',      ville: 'Nepean',     resume: 'Spécialiste en développement mobile iOS et Android.',
    competences: [{ nom: 'Swift',       niveau: 'AVANCE' }, { nom: 'Kotlin',     niveau: 'AVANCE' },    { nom: 'Flutter',    niveau: 'INTERMEDIAIRE' }],
    experiences: [{ poste: 'Développeuse mobile', Entreprise: 'AppNorth Inc.', domaine: 'Mobile', dateDebut: new Date('2019-01-01'), dateFin: new Date('2023-01-01'), description: 'Développement d\'apps iOS/Android.' }],
    formations:  [{ diplome: 'Baccalauréat en informatique', niveauDiplome: 'BACHELORS', etablissement: 'Université Carleton', anneeObtention: 2018 }],
  },
  { prenom: 'François', nom: 'Royer',      email: 'francois.royer@lacitec.on.ca',   ville: 'Ottawa',     resume: 'Expert en bases de données et administration Oracle.',
    competences: [{ nom: 'Oracle',      niveau: 'AVANCE' }, { nom: 'MySQL',      niveau: 'AVANCE' },    { nom: 'MongoDB',    niveau: 'INTERMEDIAIRE' }],
    experiences: [{ poste: 'DBA Senior', Entreprise: 'Banque Nationale', domaine: 'Base de données', dateDebut: new Date('2014-01-01'), dateFin: new Date('2022-01-01'), description: 'Administration et optimisation de bases de données.' }],
    formations:  [{ diplome: 'DEC en informatique', niveauDiplome: 'DEC', etablissement: 'Cégep de Rimouski', anneeObtention: 2013 }],
  },
  { prenom: 'Gabrielle', nom: 'Nadeau',   email: 'gabrielle.nadeau@lacitec.on.ca', ville: 'Gatineau',   resume: 'Développeuse cloud et DevOps certifiée AWS.',
    competences: [{ nom: 'AWS',         niveau: 'AVANCE' }, { nom: 'Terraform',  niveau: 'AVANCE' },    { nom: 'Kubernetes', niveau: 'INTERMEDIAIRE' }],
    experiences: [{ poste: 'Ingénieure DevOps', Entreprise: 'Amazon Canada', domaine: 'Cloud', dateDebut: new Date('2020-03-01'), dateFin: null, description: 'Déploiement et automatisation cloud.' }],
    formations:  [{ diplome: 'Baccalauréat en systèmes informatiques', niveauDiplome: 'BACHELORS', etablissement: 'Université d\'Ottawa', anneeObtention: 2019 }],
  },
  { prenom: 'Hugo',     nom: 'Bergeron',   email: 'hugo.bergeron@lacitec.on.ca',    ville: 'Ottawa',     resume: 'Professeur en programmation orientée objet et génie logiciel.',
    competences: [{ nom: 'C++',         niveau: 'AVANCE' }, { nom: 'C#',         niveau: 'AVANCE' },    { nom: 'UML',        niveau: 'INTERMEDIAIRE' }],
    experiences: [{ poste: 'Ingénieur logiciel', Entreprise: 'Nortel Networks', domaine: 'Développement', dateDebut: new Date('2012-01-01'), dateFin: new Date('2018-01-01'), description: 'Développement de systèmes embarqués.' }],
    formations:  [{ diplome: 'Maîtrise en génie électrique', niveauDiplome: 'MASTERS', etablissement: 'Université de Sherbrooke', anneeObtention: 2011 }],
  },
  { prenom: 'Isabelle', nom: 'Fortin',     email: 'isabelle.fortin@lacitec.on.ca',  ville: 'Kanata',     resume: 'Experte en cybersécurité et tests d\'intrusion.',
    competences: [{ nom: 'Ethical Hacking', niveau: 'AVANCE' }, { nom: 'Kali Linux', niveau: 'AVANCE' }, { nom: 'Wireshark', niveau: 'INTERMEDIAIRE' }],
    experiences: [{ poste: 'Consultante sécurité', Entreprise: 'SecureIT', domaine: 'Sécurité', dateDebut: new Date('2016-06-01'), dateFin: new Date('2022-06-01'), description: 'Tests de pénétration et audits de sécurité.' }],
    formations:  [{ diplome: 'Baccalauréat en sécurité informatique', niveauDiplome: 'BACHELORS', etablissement: 'Université du Québec', anneeObtention: 2015 }],
  },
  { prenom: 'Julien',   nom: 'Poirier',    email: 'julien.poirier@lacitec.on.ca',   ville: 'Ottawa',     resume: 'Développeur fullstack spécialisé en TypeScript et Next.js.',
    competences: [{ nom: 'TypeScript',  niveau: 'AVANCE' }, { nom: 'Next.js',    niveau: 'AVANCE' },    { nom: 'GraphQL',    niveau: 'INTERMEDIAIRE' }],
    experiences: [{ poste: 'Développeur senior', Entreprise: 'Shopify', domaine: 'Web', dateDebut: new Date('2020-01-01'), dateFin: null, description: 'Développement de fonctionnalités e-commerce.' }],
    formations:  [{ diplome: 'Baccalauréat en informatique', niveauDiplome: 'BACHELORS', etablissement: 'UQAM', anneeObtention: 2019 }],
  },
  { prenom: 'Karine',   nom: 'Mercier',    email: 'karine.mercier@lacitec.on.ca',   ville: 'Barrhaven',  resume: 'Spécialiste en gestion de projets informatiques et méthodologies agiles.',
    competences: [{ nom: 'Scrum',       niveau: 'AVANCE' }, { nom: 'Jira',       niveau: 'AVANCE' },    { nom: 'MS Project', niveau: 'INTERMEDIAIRE' }],
    experiences: [{ poste: 'Cheffe de projet TI', Entreprise: 'CGI', domaine: 'Gestion', dateDebut: new Date('2015-01-01'), dateFin: new Date('2023-01-01'), description: 'Gestion de projets d\'envergure.' }],
    formations:  [{ diplome: 'MBA en gestion TI', niveauDiplome: 'MASTERS', etablissement: 'HEC Montréal', anneeObtention: 2014 }],
  },
  { prenom: 'Luc',      nom: 'Desrochers', email: 'luc.desrochers@lacitec.on.ca',   ville: 'Ottawa',     resume: 'Expert en analyse de données et visualisation avec Python.',
    competences: [{ nom: 'Pandas',      niveau: 'AVANCE' }, { nom: 'Tableau',    niveau: 'AVANCE' },    { nom: 'R',          niveau: 'INTERMEDIAIRE' }],
    experiences: [{ poste: 'Analyste de données', Entreprise: 'Statistique Canada', domaine: 'Données', dateDebut: new Date('2017-09-01'), dateFin: null, description: 'Analyse et visualisation de données gouvernementales.' }],
    formations:  [{ diplome: 'Maîtrise en statistiques', niveauDiplome: 'MASTERS', etablissement: 'Université d\'Ottawa', anneeObtention: 2016 }],
  },
  { prenom: 'Marie',    nom: 'Lavoie',     email: 'marie.lavoie@lacitec.on.ca',     ville: 'Gloucester', resume: 'Développeuse embarquée et spécialiste en IoT.',
    competences: [{ nom: 'C',           niveau: 'AVANCE' }, { nom: 'Arduino',    niveau: 'AVANCE' },    { nom: 'Raspberry Pi', niveau: 'INTERMEDIAIRE' }],
    experiences: [{ poste: 'Ingénieure systèmes embarqués', Entreprise: 'BlackBerry', domaine: 'Embarqué', dateDebut: new Date('2014-06-01'), dateFin: new Date('2021-06-01'), description: 'Développement firmware et drivers.' }],
    formations:  [{ diplome: 'Baccalauréat en génie informatique', niveauDiplome: 'BACHELORS', etablissement: 'Université de Waterloo', anneeObtention: 2013 }],
  },
  { prenom: 'Nicolas',  nom: 'Pelletier',  email: 'nicolas.pelletier@lacitec.on.ca', ville: 'Ottawa',    resume: 'Développeur jeux vidéo et graphisme 3D temps réel.',
    competences: [{ nom: 'Unity',       niveau: 'AVANCE' }, { nom: 'C#',         niveau: 'AVANCE' },    { nom: 'Blender',    niveau: 'INTERMEDIAIRE' }],
    experiences: [{ poste: 'Développeur jeux', Entreprise: 'Ubisoft Montréal', domaine: 'Jeux vidéo', dateDebut: new Date('2018-03-01'), dateFin: new Date('2023-03-01'), description: 'Développement de mécaniques de jeu.' }],
    formations:  [{ diplome: 'Baccalauréat en multimédia', niveauDiplome: 'BACHELORS', etablissement: 'NAD École', anneeObtention: 2017 }],
  },
  { prenom: 'Olivia',   nom: 'Champagne',  email: 'olivia.champagne@lacitec.on.ca', ville: 'Gatineau',  resume: 'Architecte en systèmes distribués et microservices.',
    competences: [{ nom: 'Kafka',       niveau: 'AVANCE' }, { nom: 'Redis',      niveau: 'AVANCE' },    { nom: 'Go',         niveau: 'INTERMEDIAIRE' }],
    experiences: [{ poste: 'Architecte backend', Entreprise: 'Desjardins', domaine: 'Architecture', dateDebut: new Date('2016-01-01'), dateFin: null, description: 'Conception de systèmes distribués haute disponibilité.' }],
    formations:  [{ diplome: 'Maîtrise en informatique distribuée', niveauDiplome: 'MASTERS', etablissement: 'McGill University', anneeObtention: 2015 }],
  },
]

// ── Seed principal ───────────────────────────────────────────────────────────

async function main() {
  const [hashAdmin, hashRh, hashProf] = await Promise.all([
    bcrypt.hash('Admin1234!', 10),
    bcrypt.hash('RhSkillMap1!', 10),
    bcrypt.hash('Prof1234!', 10),
  ])

  // Utilisateurs système
  const admin = await prisma.user.upsert({
    where:  { email: 'admin@lacitec.on.ca' },
    update: { nom: 'Admin', prenom: 'SkillMap' },
    create: { email: 'admin@lacitec.on.ca', nom: 'Admin', prenom: 'SkillMap', passwordHash: hashAdmin, role: 'ADMIN', isActive: true },
  })

  const rh = await prisma.user.upsert({
    where:  { email: 'rh@lacitec.on.ca' },
    update: { nom: 'RH', prenom: 'SkillMap' },
    create: { email: 'rh@lacitec.on.ca', nom: 'RH', prenom: 'SkillMap', passwordHash: hashRh, role: 'RH', isActive: true },
  })

  const profTest = await prisma.user.upsert({
    where:  { email: 'prof@lacitec.on.ca' },
    update: { nom: 'Professeur', prenom: 'Test' },
    create: { email: 'prof@lacitec.on.ca', nom: 'Professeur', prenom: 'Test', passwordHash: hashProf, role: 'PROFESSEUR', isActive: true },
  })

  console.log('Utilisateur créé :', admin.email,   '| rôle :', admin.role)
  console.log('Utilisateur créé :', rh.email,      '| rôle :', rh.role)
  console.log('Utilisateur créé :', profTest.email, '| rôle :', profTest.role)

  // 15 professeurs de test
  for (const data of PROFESSEURS) {
    // 1. Créer ou mettre à jour l'utilisateur
    const user = await prisma.user.upsert({
      where:  { email: data.email },
      update: { nom: data.nom, prenom: data.prenom },
      create: {
        email:        data.email,
        nom:          data.nom,
        prenom:       data.prenom,
        passwordHash: hashProf,
        role:         'PROFESSEUR',
        isActive:     true,
      },
    })

    // 2. Créer ou mettre à jour le profil professeur
    const professor = await prisma.professor.upsert({
      where:  { userId: user.id },
      update: { ville: data.ville, resume: data.resume },
      create: { userId: user.id, ville: data.ville, resume: data.resume },
    })

    // 3. Compétences — supprimer et recréer
    await prisma.professorSkill.deleteMany({ where: { professorId: professor.id } })
    for (const comp of data.competences) {
      const skill = await prisma.skill.upsert({
        where:  { nom: comp.nom },
        update: {},
        create: { nom: comp.nom, categorie: 'autre', description: '' },
      })
      await prisma.professorSkill.create({
        data: { professorId: professor.id, skillId: skill.id, niveau: comp.niveau, anneesExp: 3, source: 'SAISIE_MANUELLE' },
      })
    }

    // 4. Expériences — supprimer et recréer
    await prisma.experience.deleteMany({ where: { professorId: professor.id } })
    for (const exp of data.experiences) {
      await prisma.experience.create({
        data: { professorId: professor.id, ...exp },
      })
    }

    // 5. Formations — supprimer et recréer
    await prisma.formation.deleteMany({ where: { professorId: professor.id } })
    for (const form of data.formations) {
      await prisma.formation.create({
        data: { professorId: professor.id, ...form },
      })
    }

    console.log('Professeur créé :', user.email)
  }

  console.log('\n✅ Seed terminé —', PROFESSEURS.length, 'professeurs de test créés.')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())

  // kevin.tiam@lacitec.on.ca
  // KEvintiam7816&

  // rostand.tiam@lacitec.on.ca
  // ROstandtiam9839$