# Cahier de Conception — Application Web de Gestion de CV
**Défi Informatique La Cité 2026**
Date : 10 mai 2026

---

## 1. Architecture technique

### 1.1 Vue globale

```
┌─────────────────────────────────────────────────────┐
│               NAVIGATEUR (HTTPS)                    │
└──────────────────────┬──────────────────────────────┘
                       │ JWT via cookies HttpOnly
┌──────────────────────▼──────────────────────────────┐
│              NEXT.JS 14 (port 3000)                 │
│  • Auth + JWT        • API Routes CRUD              │
│  • Prisma ORM        • Upload fichiers CV           │
└────────┬─────────────────────────┬──────────────────┘
         │ Prisma                  │ HTTP interne Docker
         │                ┌────────▼──────────────────┐
         │                │   FASTAPI (port 8000)     │
         │                │  • Extraction CV (LLM)    │
         │                │  • Algorithme affectation │
         │                │  • SQLAlchemy ORM         │
         │                └────────┬──────────────────┘
┌────────▼────────────────────────▼──────────────────┐
│              POSTGRESQL (port 5432)                 │
└─────────────────────────────────────────────────────┘

         ┌───────────────────────────────────┐
         │    STOCKAGE FICHIERS (local)      │
         │  $UPLOADS_DIR/cvs/{profId}/...    │
         └───────────────────────────────────┘
```

### 1.2 Stack technologique

| Couche | Technologie | Version |
|---|---|---|
| Frontend | Next.js + Tailwind CSS + shadcn/ui | 14 |
| Backend CRUD/Auth | Next.js API Routes + Prisma | 14 / 5.x |
| Backend IA | FastAPI + SQLAlchemy + Alembic | Python 3.11 |
| Base de données | PostgreSQL | 15 |
| Extraction PDF | PyMuPDF + python-docx | — |
| LLM | API open-source fournie | — |
| Auth | JWT + bcrypt (coût >= 10) | — |
| Déploiement | Docker Compose | 3 conteneurs |

### 1.3 Communication inter-services

- Next.js appelle FastAPI uniquement pour 2 opérations :
  - `POST /extract` — analyse d'un CV
  - `POST /score` — calcul des scores d'affectation
- FastAPI n'est pas exposé publiquement (réseau Docker interne uniquement)
- Latence interne : < 5 ms (même réseau Docker)

---

## 2. Modèle de données

> Référence : `Docs/Modele.js` (schéma Prisma)

### 2.1 Entités principales

| Entité | Rôle |
|---|---|
| `User` | Compte de connexion (tous les rôles) |
| `Professor` | Profil étendu du professeur (1-à-1 avec User) |
| `CvExtraction` | Fichier CV + statut d'analyse IA |
| `Experience` | Expériences professionnelles extraites |
| `Formation` | Diplômes et formations extraits |
| `Skill` | Référentiel global des compétences |
| `ProfessorSkill` | Compétences maîtrisées par un professeur |
| `Program` | Programme académique (PI, IAI…) |
| `Course` | Cours du catalogue |
| `CourseSkill` | Compétences requises par un cours |
| `Session` | Session académique (Automne/Hiver/Été) |
| `WeightsConfig` | Pondérations de l'algorithme par session |
| `Assignment` | Affectation professeur-cours par session |

### 2.2 Machines à états

**CvExtraction.status**
```
PENDING → EXTRACTED → VALIDATED
```

**Session.statut**
```
PLANIFIEE → ACTIVE → ARCHIVEE
```

**Assignment.statut**
```
PROPOSEE → AJUSTEE → FINALISEE
```

### 2.3 Algorithme de scoring

Pour chaque paire (Professeur, Cours) :

| Critère | Calcul | Défaut |
|---|---|---|
| Compétences | Moyenne des scores individuels (100/50/0%) | 40% |
| Expérience | Moyenne anneesExp validées / 10 × 100 (plafond 100) | 25% |
| Formation | PhD=100, Maîtrise=80, Bacc=60, DEC=40, Autre=20 | 20% |
| Historique | A déjà enseigné ce cours = 100, sinon = 0 | 15% |

**Score final** = (comp×pct + exp×pct + form×pct + hist×pct) / 100

---

## 3. Conception API

### 3.1 Endpoints Next.js (publics)

#### Authentification
| Méthode | Route | Rôle requis | Description |
|---|---|---|---|
| POST | `/api/auth/login` | — | Connexion, retourne JWT en cookie |
| POST | `/api/auth/logout` | Tous | Déconnexion, efface les cookies |
| POST | `/api/auth/refresh` | Tous | Renouvelle le JWT via refresh token |

#### Utilisateurs (Admin)
| Méthode | Route | Rôle requis | Description |
|---|---|---|---|
| GET | `/api/users` | ADMIN | Liste tous les comptes |
| POST | `/api/users` | ADMIN | Crée un compte |
| PUT | `/api/users/:id` | ADMIN | Modifie un compte |
| PUT | `/api/users/:id/toggle` | ADMIN | Active/désactive un compte |

#### CV
| Méthode | Route | Rôle requis | Description |
|---|---|---|---|
| POST | `/api/cv/upload` | PROFESSEUR | Upload et lance l'extraction IA |
| GET | `/api/cv/:professorId` | PROFESSEUR / RH | Historique des CVs |
| PUT | `/api/cv/:id/validate` | PROFESSEUR | Valide et sauvegarde les données extraites |

#### Cours
| Méthode | Route | Rôle requis | Description |
|---|---|---|---|
| GET | `/api/courses` | Tous | Liste les cours actifs |
| POST | `/api/courses` | ADMIN / RH | Crée un cours |
| PUT | `/api/courses/:id` | ADMIN / RH | Modifie un cours |
| PUT | `/api/courses/:id/archive` | ADMIN / RH | Archive un cours (suppression logique) |

#### Programmes
| Méthode | Route | Rôle requis | Description |
|---|---|---|---|
| GET | `/api/programs` | Tous | Liste les programmes |
| POST | `/api/programs` | ADMIN / RH | Crée un programme |
| PUT | `/api/programs/:id` | ADMIN / RH | Modifie un programme |
| DELETE | `/api/programs/:id` | ADMIN | Supprime un programme |

#### Compétences
| Méthode | Route | Rôle requis | Description |
|---|---|---|---|
| GET | `/api/skills` | Tous | Liste les compétences |
| POST | `/api/skills` | ADMIN / RH | Crée une compétence |
| PUT | `/api/skills/:id` | ADMIN / RH | Modifie une compétence |
| DELETE | `/api/skills/:id` | ADMIN | Supprime une compétence |

#### Sessions
| Méthode | Route | Rôle requis | Description |
|---|---|---|---|
| GET | `/api/sessions` | RH / ADMIN | Liste les sessions |
| POST | `/api/sessions` | ADMIN / RH | Crée une session |
| PUT | `/api/sessions/:id/activate` | ADMIN | Passe la session en ACTIVE |

#### Pondérations
| Méthode | Route | Rôle requis | Description |
|---|---|---|---|
| GET | `/api/sessions/:id/weights` | RH / ADMIN | Récupère la config de pondération |
| POST | `/api/sessions/:id/weights` | ADMIN / RH | Configure les pondérations (somme = 100) |

#### Affectations
| Méthode | Route | Rôle requis | Description |
|---|---|---|---|
| POST | `/api/assignments/launch` | RH | Lance le calcul des affectations |
| GET | `/api/assignments?sessionId=` | RH / ADMIN | Liste les affectations d'une session |
| PUT | `/api/assignments/:id` | RH | Ajuste manuellement une affectation |
| PUT | `/api/assignments/finalize` | RH | Finalise toutes les affectations d'une session |

#### Historique
| Méthode | Route | Rôle requis | Description |
|---|---|---|---|
| GET | `/api/history?sessionId=&professorId=&courseId=` | RH / ADMIN | Historique filtrable |
| GET | `/api/history/export?sessionId=` | RH / ADMIN | Export PDF des affectations finalisées |

#### Logs (Admin)
| Méthode | Route | Rôle requis | Description |
|---|---|---|---|
| GET | `/api/logs` | ADMIN | Consulte les logs de sécurité |

### 3.2 Endpoints FastAPI (internes, non exposés)

| Méthode | Route | Description |
|---|---|---|
| POST | `/extract` | Reçoit un chemin de fichier, extrait le texte, appelle le LLM, retourne JSON structuré |
| POST | `/score` | Reçoit un sessionId, calcule tous les scores, insère les Assignment en base |

---

## 4. Diagrammes

| Diagramme | Fichier |
|---|---|
| Cas d'utilisation | `Diagrammes/diagramme_cas_utilisation.puml` |
| Classes | `Diagrammes/diagramme_classes.puml` |
| Séquence — Authentification | `Diagrammes/diagramme_sequence_auth.puml` |
| Séquence — Upload CV | `Diagrammes/diagramme_sequence_cv.puml` |
| Séquence — Affectation | `Diagrammes/diagramme_sequence_affectation.puml` |

---

## 5. Sécurité

| Mesure | Implémentation |
|---|---|
| Hashage mots de passe | bcrypt, coût >= 10 |
| Tokens | JWT (exp: 2h) + refresh token (exp: 7j) |
| Transport tokens | Cookies HttpOnly + Secure uniquement (pas localStorage) |
| Expiration inactivité | 30 minutes |
| Protection CSRF | Tokens anti-CSRF sur formulaires sensibles |
| Injection SQL | Requêtes via Prisma/SQLAlchemy uniquement (pas de SQL brut) |
| Contrôle d'accès | Middleware vérifiant le rôle à chaque requête API |
| Blocage brute-force | Compte désactivé après 5 tentatives échouées consécutives |
| FastAPI | Non exposé publiquement — accessible uniquement depuis Next.js via réseau Docker |

---

## 6. Variables d'environnement

### Next.js (`.env`)
```env
DATABASE_URL=postgresql://user:password@db:5432/gestion_cv
JWT_SECRET=<secret_fort_32_chars_min>
JWT_REFRESH_SECRET=<secret_fort_32_chars_min>
FASTAPI_URL=http://fastapi:8000
UPLOADS_DIR=./uploads
```

### FastAPI (`.env`)
```env
DATABASE_URL=postgresql://user:password@db:5432/gestion_cv
UPLOADS_DIR=/app/uploads
LLM_API_URL=<url_api_llm_fournie>
LLM_API_KEY=<cle_api_llm>
```

---

## 7. Structure des dossiers projet

```
gestion-cv/
├── docker-compose.yml
├── frontend/                   # Next.js 14
│   ├── app/
│   │   ├── (auth)/login/
│   │   ├── dashboard/
│   │   ├── cv/
│   │   ├── rh/
│   │   └── admin/
│   ├── components/
│   ├── lib/
│   │   ├── prisma.ts
│   │   └── auth.ts
│   ├── prisma/
│   │   └── schema.prisma
│   └── .env
├── backend/                    # FastAPI
│   ├── main.py
│   ├── routes/
│   │   ├── extract.py
│   │   └── score.py
│   ├── services/
│   │   ├── pdf_extractor.py
│   │   ├── llm_client.py
│   │   └── scoring.py
│   ├── models/                 # SQLAlchemy
│   ├── migrations/             # Alembic
│   └── .env
└── uploads/                    # Fichiers CV (volume Docker partagé)
    └── cvs/
        └── {professorId}/
```

---

## 8. Contraintes de déploiement (Docker Compose)

```yaml
# Structure des 3 conteneurs
services:
  db:        # PostgreSQL — port 5432
  frontend:  # Next.js   — port 3000
  backend:   # FastAPI   — port 8000 (interne uniquement)

volumes:
  uploads:   # Volume partagé entre frontend et backend pour les fichiers CV
  pgdata:    # Persistance PostgreSQL
```

Le volume `uploads` est partagé entre Next.js (écriture du fichier) et FastAPI (lecture pour extraction).
