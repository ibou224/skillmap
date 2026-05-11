// =============================================================================
// ENUMS
// Un enum est une liste de valeurs fixes autorisées pour un champ.
// Avantage : évite les erreurs de saisie et documente les valeurs possibles.
// =============================================================================

// Les trois rôles possibles dans l'application.
// Chaque rôle détermine les pages accessibles et les actions autorisées.
// - PROFESSEUR : gère son CV et consulte ses affectations
// - RH         : lance et ajuste les affectations
// - ADMIN      : gère les utilisateurs et configure le système
enum Role {
  PROFESSEUR
  RH
  ADMIN
}

// État d'avancement de l'analyse d'un CV par le LLM.
// Ordre d'évolution : PENDING → EXTRACTED → VALIDATED
// - PENDING   : fichier uploadé, analyse pas encore lancée
// - EXTRACTED : LLM a terminé, données en attente de validation du professeur
// - VALIDATED : professeur a confirmé toutes les données extraites
enum StatutExtraction {
  PENDING
  EXTRACTED
  VALIDATED
}

// Niveau de maîtrise d'une compétence.
// Utilisé dans ProfessorSkill (ce que le prof maîtrise)
// et CourseSkill (ce que le cours exige).
// Ordre croissant : DEBUTANT < INTERMEDIAIRE < AVANCE
// Règle algorithme : si prof.niveau >= cours.niveauRequis → compétence validée ✅
enum NiveauCompetence {
  DEBUTANT
  INTERMEDIAIRE
  AVANCE
}

// Niveau académique du diplôme le plus élevé du professeur.
// Utilisé par l'algorithme pour calculer le scoreFormation.
// Correspondance des scores :
//   DOCTORAT      → 100%
//   MAITRISE      → 80%
//   BACCALAUREAT  → 60%
//   DEC_TECHNIQUE → 40%
//   AUTRE         → 20%
enum NiveauDiplome {
  DOCTORAT
  MAITRISE
  BACCALAUREAT
  DEC_TECHNIQUE
  AUTRE
}

// État d'une session académique.
// - PLANIFIEE : créée, affectations pas encore lancées
// - ACTIVE    : en cours, le RH peut lancer les affectations
// - ARCHIVEE  : terminée, tout est en lecture seule
// Une seule session peut être ACTIVE à la fois (validé dans l'API).
enum StatutSession {
  PLANIFIEE
  ACTIVE
  ARCHIVEE
}

// Période de la session dans l'année académique.
enum PeriodeSession {
  AUTOMNE
  HIVER
  ETE
}

// État d'une affectation professeur-cours.
// Ordre d'évolution : PROPOSEE → AJUSTEE → FINALISEE
// - PROPOSEE  : générée automatiquement par l'algorithme
// - AJUSTEE   : modifiée manuellement par le RH
// - FINALISEE : validée définitivement, lecture seule
enum StatutAffectation {
  PROPOSEE
  AJUSTEE
  FINALISEE
}

enum SourceDonnee {
  EXTRACTION_IA
  SAISIE_MANUELLE
}

enum TypeNotification {
  CV_UPLOADED
  CV_EXTRACTED
  CV_VALIDATED
  ASSIGNMENT_PROPOSED
  ASSIGNMENT_FINALIZED
  SESSION_ACTIVATED
  SESSION_ARCHIVED
}

// =============================================================================
// UTILISATEURS & SÉCURITÉ
// Gère les comptes de connexion, les tokens JWT et les logs de sécurité.
// =============================================================================

// Table principale des comptes utilisateurs.
// Contient les informations de connexion et de sécurité.
// Le refresh token est stocké directement ici (attribut) plutôt que dans une
// table séparée, car chaque utilisateur ne se connecte que sur un seul appareil
// à la fois — la multi-session n'est pas requise par le cahier des charges.
model User {
  id           String    @id @default(uuid())
  email        String    @unique   // Email institutionnel — identifiant de connexion unique
  passwordHash String              // Haché avec bcrypt (coût >= 10) — JAMAIS en clair
  role         Role      @default(PROFESSEUR)
  isActive     Boolean   @default(true) // Désactiver sans supprimer — préserve l'historique

  // Après 5 tentatives échouées consécutives, le compte est verrouillé temporairement.
  // Le middleware vérifie lockedUntil avant chaque tentative de connexion.
  loginAttempts Int       @default(0)   // Compteur de tentatives échouées — remis à 0 après succès
  lockedUntil   DateTime? // NULL = compte actif, sinon = verrouillé jusqu'à cette date
  refreshTokenHash String?   // Hash bcrypt du refresh token actif (NULL = pas de session active)
  refreshExpiresAt DateTime? // Date d'expiration du refresh token (7 jours après émission)
  lastLoginAt DateTime? // Timestamp de la dernière connexion réussie
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  // Relations
  professor  Professor?      // Un User de type PROFESSEUR a un profil Professor (1-à-1)
  auditLogs  AuditLog[]      // Toutes les actions effectuées par cet utilisateur
  notifications       Notification[]  // Notifications reçues par cet utilisateur
}

// Table des logs de sécurité et d'audit.
// Enregistre toutes les actions importantes pour la traçabilité.
// Exemples d'actions : LOGIN_SUCCESS, LOGIN_FAILED, CV_UPLOADED,
//                      ASSIGNMENT_FINALIZED, ACCOUNT_LOCKED, WEIGHTS_UPDATED
// Ces logs sont en lecture seule — jamais modifiés ni supprimés.
model AuditLog {
  id         String   @id @default(uuid())
  userId     String?                          // NULL = action système automatique
  user       User?    @relation(fields: [userId], references: [id])
  action     String                           // Code de l'action (ex: "LOGIN_FAILED")
  entityType String?                          // Entité concernée (ex: "Assignment", "Professor")
  entityId   String?                          // ID de l'entité concernée
  metadata   Json?                            // Détails supplémentaires (IP, changements effectués)
  ipAddress  String?                          // Adresse IP de l'utilisateur
  createdAt  DateTime @default(now())

  @@index([entityType, entityId])
}

// =============================================================================
// PROFILS PROFESSEURS
// =============================================================================

model Professor {
  id        String   @id @default(uuid())
  userId    String   @unique    // Clé étrangère unique — garantit la relation 1-à-1 avec User
  user      User     @relation(fields: [userId], references: [id])
  nom       String              // Extrait du CV puis validé par le professeur
  prenom    String              // Extrait du CV puis validé par le professeur
  telephone String?             // Optionnel — tous les CV n'incluent pas un téléphone
  createdAt DateTime @default(now())
  cvExtractions CvExtraction[]   // Historique de tous ses CV uploadés et analysés
  skills        ProfessorSkill[] // Compétences techniques qu'il maîtrise
  experiences   Experience[]     // Expériences professionnelles extraites de son CV
  formations    Formation[]      // Diplômes et formations académiques
  assignments   Assignment[]     // Affectations aux cours (sessions passées et actuelles)
}

// =============================================================================
// GESTION DES CV
// Stocke le fichier uploadé et son statut.
// Les données extraites (compétences, expériences, formations) sont dans
// leurs propres tables pour faciliter les modifications et les requêtes.
//
// FLUX D'EXTRACTION :
// 1. Professeur uploade PDF/Word → CvExtraction créée (status: PENDING)
// 2. Next.js envoie le fichier à FastAPI
// 3. FastAPI extrait le texte brut EN MÉMOIRE (non sauvegardé en BD)
// 4. FastAPI envoie le texte au LLM avec un prompt structuré
// 5. LLM retourne un JSON → FastAPI crée les lignes dans Experience, Formation, ProfessorSkill
// 6. Status passe à EXTRACTED, extractedAt est renseigné
// 7. Professeur valide ou corrige dans l'interface
// 8. Status passe à VALIDATED, validatedAt est renseigné
// =============================================================================

// Historique des CV uploadés et analysés pour chaque professeur.
// Cette table ne contient PAS les données extraites — elles sont dans
// Experience, Formation et ProfessorSkill.
// Chaque nouvel upload crée une nouvelle ligne (version++), l'historique est conservé.
model CvExtraction {
  id          String           @id @default(uuid())
  professorId String
  professor   Professor        @relation(fields: [professorId], references: [id], onDelete: Cascade)
  filePath    String           // Chemin du fichier stocké sur le serveur (ex: /uploads/cvs/prof_abc_v2.pdf)
  fileName    String           // Nom original du fichier — affiché dans l'interface (ex: MonCV_2026.pdf)
  status      StatutExtraction @default(PENDING)
  version     Int              @default(1) // Incrémenté à chaque nouvel upload — permet de voir l'historique
  extractedAt DateTime?        // Renseigné quand le LLM a terminé l'extraction
  validatedAt DateTime?        // Renseigné quand le professeur a validé les données
  createdAt   DateTime         @default(now())

  experiences Experience[]
  formations  Formation[]
  skills      ProfessorSkill[]

  @@unique([professorId, version])
}

// Expériences professionnelles extraites du CV.
// Chaque expérience est une ligne séparée — le professeur peut modifier
// ou supprimer une expérience précise sans toucher aux autres.
// La durée (anneesExp) est calculée dynamiquement : dateFin - dateDebut.
// Si dateFin est NULL → poste encore en cours aujourd'hui.
model Experience {
  id          String    @id @default(uuid())
  professorId String
  professor   Professor @relation(fields: [professorId], references: [id], onDelete: Cascade)
  poste       String    // Intitulé du poste (ex: "Développeur Backend", "Enseignant en informatique")
  domaine     String    // Domaine d'activité (ex: "Intelligence Artificielle", "Développement Web")
  dateDebut      DateTime  // Date de début du poste — sert à calculer la durée
  dateFin        DateTime? // NULL = poste actuel en cours. Sinon = date de fin
  description    String?   // Contexte optionnel du poste — visible par le RH
  cvExtractionId String?
  cvExtraction   CvExtraction? @relation(fields: [cvExtractionId], references: [id], onDelete: SetNull)
}

// Diplômes et formations académiques extraits du CV.
// Chaque formation est une ligne séparée pour faciliter la modification.
// niveauDiplome est un ENUM normalisé utilisé par l'algorithme pour calculer
// le scoreFormation (voir section ALGORITHME dans WeightsConfig).
model Formation {
  id             String        @id @default(uuid())
  professorId    String
  professor      Professor     @relation(fields: [professorId], references: [id], onDelete: Cascade)
  diplome        String        // Nom exact du diplôme tel qu'affiché dans l'UI (ex: "Maîtrise en informatique")
  niveauDiplome  NiveauDiplome // Niveau normalisé utilisé par l'algorithme (DOCTORAT, MAITRISE, etc.)
  etablissement  String        // Nom de l'établissement (ex: "Université de Montréal", "La Cité")
  anneeObtention Int           // Année d'obtention du diplôme (ex: 2020)
  cvExtractionId String?
  cvExtraction   CvExtraction? @relation(fields: [cvExtractionId], references: [id], onDelete: SetNull)
}

// =============================================================================
// RÉFÉRENTIEL MÉTIER
// Définit les programmes, les cours et les compétences du collège.
// C'est ici que l'algorithme puise les données pour calculer les scores.
//
// LOGIQUE DE COMPARAISON (cœur de l'algorithme) :
// Pour chaque cours, on compare CourseSkill (ce que le cours exige)
// avec ProfessorSkill (ce que le professeur maîtrise) :
//
//   Niveaux en valeur numérique :
//   DEBUTANT = 1 | INTERMEDIAIRE = 2 | AVANCE = 3
//
//   Pour chaque compétence requise par le cours :
//   - prof.niveau >= cours.niveauRequis → score individuel = 100%  
//   - prof.niveau <  cours.niveauRequis → score individuel = 50%   
//   - compétence absente chez le prof   → score individuel = 0%    
//
//   Le poidsCritique (1 à 5) de CourseSkill pondère chaque compétence :
//   une compétence critique (5/5) pèse plus qu'une compétence secondaire (1/5).
//
//   scoreCompetences = somme(scoreIndividuel × poidsCritique) / somme(poidsCritique) × 100
// =============================================================================

// Référentiel global de toutes les compétences disponibles dans le système.
// Géré par l'administrateur via l'interface d'administration.
// Quand le LLM extrait une compétence inconnue d'un CV, elle est ajoutée ici automatiquement.
model Skill {
  id          String   @id @default(uuid())
  nom         String   @unique // Nom unique (ex: "Python", "React", "Machine Learning")
  categorie   String           // Regroupement (ex: "Langage", "Framework", "IA", "Base de données")
  description String?          // Description optionnelle pour clarifier la compétence
  createdAt   DateTime @default(now())

  professors ProfessorSkill[] // Professeurs qui maîtrisent cette compétence
  courses    CourseSkill[]    // Cours qui requièrent cette compétence
}

// Table de liaison N-N entre Professeur et Compétence.
// Stocke le niveau de maîtrise et les années d'expérience du professeur
// pour chaque compétence qu'il possède.
// source indique si la donnée vient du LLM ou d'une saisie manuelle —
// utile pour savoir à quel point on peut faire confiance à la donnée.
model ProfessorSkill {
  professorId String
  skillId     String
  anneesExp   Int              // Années d'expérience dans cette compétence précise
  niveau      NiveauCompetence // Niveau de maîtrise : DEBUTANT, INTERMEDIAIRE ou AVANCE
  updatedAt   DateTime         @updatedAt

  cvExtractionId String?
  cvExtraction   CvExtraction? @relation(fields: [cvExtractionId], references: [id], onDelete: SetNull)

  professor Professor @relation(fields: [professorId], references: [id], onDelete: Cascade)
  skill     Skill     @relation(fields: [skillId], references: [id], onDelete: Cascade)

  @@id([professorId, skillId])
}

// Programme académique du collège.
// Exemples : Programmation Informatique (PI), Intelligence Artificielle (IAI)
// Un programme regroupe plusieurs cours répartis sur plusieurs étapes (semestres).
model Program {
  id          String   @id @default(uuid())
  code        String   @unique // Code court utilisé dans les filtres (ex: "PI", "IAI")
  nom         String           // Nom complet du programme
  description String?          // Description du programme (optionnelle)
  nbEtapes    Int              // Nombre total de semestres (ex: 6)

  courses Course[] // Liste de tous les cours de ce programme
}

// Cours disponible dans le catalogue du collège.
// Les cours ne sont JAMAIS supprimés physiquement — on utilise isArchived=true
// pour les désactiver. Cela préserve l'historique des affectations passées.
// Un cours archivé n'apparaît plus dans les nouvelles affectations.
model Course {
  id         String   @id @default(uuid())
  code       String   @unique // Code officiel (ex: "PROG302", "IA201")
  nom        String           // Nom complet (ex: "Développement Web Client")
  programId  String
  program    Program  @relation(fields: [programId], references: [id])
  etape      Int              // Semestre dans lequel ce cours est enseigné (ex: 3)
  isArchived Boolean  @default(false) // false = actif, true = archivé (invisible dans les nouvelles affectations)
  createdAt  DateTime @default(now())

  skills      CourseSkill[] // Compétences requises pour enseigner ce cours
  assignments Assignment[]  // Affectations passées et actuelles pour ce cours
}

// Table de liaison N-N entre Cours et Compétence requise.
// Définit les compétences nécessaires pour enseigner chaque cours,
// leur niveau minimum requis, et leur importance relative (poidsCritique).
//
// poidsCritique (1 à 5) : permet de pondérer l'importance de chaque compétence.
// Exemple pour "Développement Web Client" :
//   JavaScript  → niveauRequis: INTERMEDIAIRE, poidsCritique: 5 (compétence essentielle)
//   HTML/CSS    → niveauRequis: INTERMEDIAIRE, poidsCritique: 4 (très important)
//   React       → niveauRequis: DEBUTANT,      poidsCritique: 3 (important)
//   Git         → niveauRequis: DEBUTANT,       poidsCritique: 1 (secondaire)
model CourseSkill {
  courseId      String
  skillId       String
  niveauRequis  NiveauCompetence // Niveau minimum requis pour enseigner ce cours
  poidsCritique Int              @default(3) // Importance relative de la compétence (1=secondaire, 5=essentielle)

  course Course @relation(fields: [courseId], references: [id], onDelete: Cascade)
  skill  Skill  @relation(fields: [skillId], references: [id], onDelete: Cascade)

  // Clé primaire composite : une compétence ne peut apparaître qu'une seule fois par cours
  @@id([courseId, skillId])
}

// =============================================================================
// SESSIONS & AFFECTATIONS
//
// ════════════════════════════════════════════════════════════════
// ALGORITHME COMPLET DE CALCUL DU SCORE DE COMPATIBILITÉ
// ════════════════════════════════════════════════════════════════
//
// Pour chaque paire (professeur, cours), FastAPI calcule 4 scores
// puis les combine selon les pondérations de WeightsConfig.
//
// ① SCORE COMPÉTENCES (scoreCompetences) :
//    Pour chaque compétence requise par le cours (CourseSkill) :
//      - prof.niveau >= cours.niveauRequis → score individuel = 100% ✅
//      - prof.niveau <  cours.niveauRequis → score individuel = 50%  ⚠️
//      - compétence absente chez le prof   → score individuel = 0%   ❌
//    Chaque score individuel est pondéré par poidsCritique (1 à 5).
//    scoreCompetences = somme(scoreIndividuel × poidsCritique)
//                     / somme(poidsCritique) × 100
//
//    Exemple : cours exige JavaScript(INTERM, poids:5), React(DEB, poids:3), Git(DEB, poids:1)
//    Prof possède : JavaScript(AVANCE), React(absent), Git(DEBUTANT)
//    → JavaScript : 100% × 5 = 500
//    → React      : 0%   × 3 = 0
//    → Git        : 100% × 1 = 100
//    → scoreCompetences = (500 + 0 + 100) / (5 + 3 + 1) = 66.7%
//
// ② SCORE EXPÉRIENCE (scoreExperience) :
//    On calcule la durée totale d'expérience du professeur dans les domaines
//    qui correspondent aux expériences enregistrées dans la table Experience.
//    La durée est calculée dynamiquement : dateFin - dateDebut (ou aujourd'hui si NULL).
//    On normalise sur 10 ans maximum → 10 ans = 100%, 5 ans = 50%, etc.
//    Si la durée totale dépasse 10 ans → scoreExperience = 100% (plafonné).
//    scoreExperience = min(totalAnneesExp / 10, 1) × 100
//
//    Exemple : 2 expériences → 3 ans + 2 ans = 5 ans total
//    → scoreExperience = (5 / 10) × 100 = 50%
//
// ③ SCORE FORMATION (scoreFormation) :
//    On évalue le diplôme le plus élevé du professeur (table Formation.niveauDiplome).
//    Correspondance fixe :
//      DOCTORAT      → 100%
//      MAITRISE      → 80%
//      BACCALAUREAT  → 60%
//      DEC_TECHNIQUE → 40%
//      AUTRE         → 20%
//
//    Exemple : prof a une MAITRISE → scoreFormation = 80%
//
// ④ SCORE HISTORIQUE (scoreHistorique) :
//    On vérifie si le professeur a déjà enseigné ce cours dans une session passée
//    (statut ARCHIVEE) en interrogeant la table Assignment.
//    On consulte TOUTES les sessions archivées (pas seulement la dernière).
//      A déjà enseigné ce cours → scoreHistorique = 100%
//      N'a jamais enseigné      → scoreHistorique = 0%
//
// ⑤ SCORE FINAL :
//    Score = (scoreCompetences × competencesPct / 100)
//          + (scoreExperience  × experiencePct  / 100)
//          + (scoreFormation   × formationPct   / 100)
//          + (scoreHistorique  × historiquePct  / 100)
//
//    Exemple avec pondérations par défaut (40/25/20/15) :
//    Score = (66.7 × 0.40) + (50 × 0.25) + (80 × 0.20) + (0 × 0.15)
//          = 26.68 + 12.5 + 16 + 0
//          = 55.18 / 100
//
// Le résultat est stocké dans :
//   Assignment.score       → score final arrondi à 2 décimales
//   Assignment.scoreDetail → détail par critère pour affichage dans l'interface RH
//   Exemple scoreDetail :
//   { "competences": 66.7, "experience": 50.0, "formation": 80.0, "historique": 0.0 }
// ════════════════════════════════════════════════════════════════
// =============================================================================

// Session académique — conteneur principal d'un cycle d'affectation.
// Regroupe une configuration de pondérations et toutes les affectations générées.
// Une seule session peut être ACTIVE à la fois (validé dans l'API FastAPI).
model Session {
  id        String         @id @default(uuid())
  nom       String                            // Nom lisible (ex: "Automne 2026")
  annee     Int                               // Année académique (ex: 2026)
  periode   PeriodeSession                    // AUTOMNE, HIVER ou ETE
  statut    StatutSession  @default(PLANIFIEE)
  createdAt DateTime       @default(now())

  weightsConfig WeightsConfig? // Configuration des pondérations pour cette session (1-à-1)
  assignments   Assignment[]   // Toutes les affectations de cette session

  @@unique([annee, periode])
}

// Configuration des pondérations de l'algorithme pour une session donnée.
// Les 4 poids définissent l'importance relative de chaque critère.
//
//    CONTRAINTE CRITIQUE : competencesPct + experiencePct + formationPct + historiquePct = 100
//    Cette contrainte est validée dans l'API FastAPI avant toute insertion.
//    Si la somme ≠ 100, l'API retourne une erreur 422 avec message explicite.
//
// Valeurs par défaut recommandées par le cahier des charges :
//   competencesPct = 40 → les compétences techniques sont le critère principal
//   experiencePct  = 25 → l'expérience dans le domaine est importante
//   formationPct   = 20 → le niveau de diplôme compte aussi
//   historiquePct  = 15 → a-t-il déjà enseigné ce cours dans une session passée ?
model WeightsConfig {
  id             String   @id @default(uuid())
  sessionId      String   @unique            // Une seule configuration par session (1-à-1)
  session        Session  @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  competencesPct Int      // Poids des compétences techniques   : entre 20 et 60  (défaut: 40)
  experiencePct  Int      // Poids des années d'expérience      : entre 10 et 40  (défaut: 25)
  formationPct   Int      // Poids du niveau de formation       : entre 10 et 35  (défaut: 20)
  historiquePct  Int      // Poids de l'historique d'enseignement : entre 0 et 30 (défaut: 15)
  createdAt      DateTime @default(now())
}

// Affectation d'un professeur à un cours pour une session donnée.
// Cycle de vie : PROPOSEE → AJUSTEE → FINALISEE
model Assignment {
  id          String            @id @default(uuid())
  sessionId   String
  professorId String
  courseId    String
  score       Float             // Score global de compatibilité (0 à 100, arrondi à 2 décimales)
  scoreDetail Json              // Détail par critère : {"competences":66.7,"experience":50.0,"formation":80.0,"historique":0.0}
  statut      StatutAffectation @default(PROPOSEE)
  createdAt   DateTime          @default(now())
  updatedAt   DateTime          @updatedAt

  session   Session   @relation(fields: [sessionId], references: [id])
  professor Professor @relation(fields: [professorId], references: [id])
  course    Course    @relation(fields: [courseId], references: [id])

  @@unique([sessionId, professorId, courseId])
  @@index([sessionId])
}

// =============================================================================
// NOTIFICATIONS IN-APP
// Permet d'informer les utilisateurs des événements importants directement
// dans l'interface sans quitter l'application.
//
// Exemples de notifications :
//   - Professeur : "Votre CV a été analysé avec succès — veuillez valider vos données"
//   - Professeur : "Vous avez été affecté au cours PROG302 pour la session Automne 2026"
//   - RH         : "Les affectations de la session Automne 2026 sont prêtes à réviser"
//   - Admin      : "Un nouveau professeur vient de soumettre son CV"
//
// entityType + entityId permettent de générer un lien direct vers la ressource
// concernée dans l'interface (ex: clic sur la notif → redirige vers l'affectation).
// =============================================================================

// Notification in-app pour un utilisateur.
// Créée automatiquement par le système lors d'événements clés.
// Une notification non lue (isRead=false) affiche un badge dans l'interface.
// Les notifications sont en lecture seule — jamais modifiées, seulement marquées comme lues.
model Notification {
  id         String   @id @default(uuid())
  userId     String
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  type       TypeNotification
  message    String   // Message lisible affiché dans l'interface (ex: "Votre CV a été analysé avec succès")
  isRead     Boolean  @default(false) // false = non lue (badge affiché), true = lue
  entityType String?  // Type de la ressource concernée (ex: "Assignment", "Session", "CvExtraction")
  entityId   String?  // ID de la ressource — permet de générer un lien direct dans l'interface
  createdAt  DateTime @default(now())

  @@index([userId, isRead])
}
