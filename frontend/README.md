# SkillMap — Frontend

Application de gestion des affectations d'enseignants, construite avec Next.js 16 App Router.

## Stack technique

| Couche           | Technologie                                            |
| ---------------- | ------------------------------------------------------ |
| Framework        | Next.js 16.2 (App Router)                              |
| Authentification | NextAuth v5 (beta)                                     |
| Base de données  | PostgreSQL 16 + Prisma 7 (Supabase compatible en prod) |
| Styles           | Tailwind CSS v4                                        |
| Emails           | Resend (notifications)                                 |
| i18n             | next-intl (FR / EN)                                    |
| Doc API          | Swagger UI (`/api-docs`) via OpenAPI                   |
| Backend IA       | FastAPI (service interne Docker)                       |
| Tests            | Vitest                                                 |

## Prérequis

- Node.js 20+
- Docker + Docker Compose (pour PostgreSQL et FastAPI)
- Fichier `.env.local` configuré (voir `.env.example`)

## Démarrage

### 📥 Cloner le projet

Si ce n'est pas déjà fait, récupérez le projet avec Git :

```bash
git clone <URL_DU_DEPOT_GIT>
cd skillmap
```

### Avec Docker (recommandé)

```bash
# Depuis la racine du projet (dossier parent de frontend/)
# 1. Construire et démarrer les services
docker compose up -d --build

# 2. Synchroniser le schéma Prisma avec la base de données locale
docker compose exec nextjs npx prisma db push

# 3. Remplir la base avec le jeu de données initial
docker compose exec nextjs npx prisma db seed
```

Services lancés :

- `http://localhost:3000` — Next.js
- `http://localhost:8000` — FastAPI (algorithme d'affectation, en réseau interne)
- `localhost:5432` — PostgreSQL

> **⚠️ En cas d'erreur `Next.js package not found` / Turbopack au lancement :**
> Exécutez la commande `docker compose rm -s -v -f nextjs && docker compose up -d --build nextjs` pour nettoyer le cache corrompu.

### 🧪 Comptes de test (générés par le seed)

- **Admin** : `admin@lacitec.on.ca` — _Mot de passe : `Admin1234!`_
- **RH** : `rh@lacitec.on.ca` — _Mot de passe : `RhSkillMap1!`_
- **Professeur (test)** : `prof@lacitec.on.ca` — _Mot de passe : `Prof1234!`_
- **Autres professeurs (générés)** : ex: `marc.tremblay@lacitec.on.ca` — _Mot de passe : `Prof@2026!`_

### En local (développement sans Docker)

⚠️ **Important : Base de données**  
Puisque vous n'utilisez pas l'environnement Docker complet, vous devez fournir vous-même une base de données PostgreSQL (installation locale sur votre OS, Cloud gratuit comme Supabase/Neon, ou via un conteneur isolé `docker compose up -d db`). N'oubliez pas de mettre à jour votre fichier `.env` avec la bonne variable `DATABASE_URL`.

```bash
# Installer les dépendances
npm install

# Appliquer le schéma Prisma
npx prisma migrate dev

# Lancer le serveur de développement
npm run dev
```

L'application est disponible sur [http://localhost:3000](http://localhost:3000).

## Scripts disponibles

```bash
npm run dev     # Serveur de développement avec hot-reload
npm run build   # Build de production
npm run start   # Démarrer le build de production
npm run lint    # Linter ESLint
npm run test    # Tests Vitest
```

## Variables d'environnement

Créer un fichier `.env.local` à la racine de `frontend/` (modèle complet dans `.env.example`) :

```env
# ── Base de données (PostgreSQL local, ou Supabase/Neon en prod) ──
DATABASE_URL="postgresql://user:password@localhost:5432/skillmap_bd"

# ── Authentification (NextAuth) — générer : openssl rand -hex 32 ──
AUTH_SECRET=your-secret-here
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=http://localhost:3000

# ── Backend FastAPI ──
# Local : BACKEND_URL ; en Docker : FASTAPI_INTERNAL_URL=http://fastapi:8000
BACKEND_URL="http://localhost:8000"
INTERNAL_API_KEY=your-api-key-here   # doit être identique à backend/.env

# ── Emails (Resend) — optionnel en dev ──
RESEND_API_KEY=re_xxx
RESEND_FROM_EMAIL=no-reply@votredomaine.com
```

> En **Docker**, ces variables sont déjà injectées par `docker-compose.yml` ; ce fichier
> `.env.local` ne sert que pour le développement **hors Docker**.

## Architecture

```text
frontend/
├── prisma/           # Schéma Prisma, migrations et scripts de seed
├── public/           # Fichiers statiques (images, polices)
└── src/
    ├── app/              # Routes Next.js (App Router) — pages et API routes
    │   ├── api/          # Routes API (auth, affectations, weights, history…)
    │   ├── api-docs/     # Swagger UI (documentation OpenAPI)
    │   └── dashboard/    # Pages dashboard (admin, rh, professeur)
    ├── features/         # Sections métier (une par page, usage unique)
    ├── components/       # Composants UI réutilisables
    │   ├── ui/           # Composants génériques (boutons, modales…)
    │   ├── layout/       # Sidebar, Header
    │   └── professeur/   # Composants spécifiques au rôle professeur
    ├── hooks/            # Hooks React (fetch, état)
    ├── lib/              # Utilitaires (prisma, auth, permissions, formatData)
    ├── constants/        # Constantes partagées (statuts, CRUD options)
    ├── i18n/             # Configuration next-intl (FR / EN)
    ├── generated/        # Client Prisma généré (non commité)
    └── proxy.js          # Middleware d'authentification (NextAuth)
```

## Rôles utilisateur

| Rôle          | Accès                                                          |
| ------------- | -------------------------------------------------------------- |
| `PROFESSEUR`  | Son profil, CV, compétences, affectations                      |
| `RH`          | CVs professeurs, affectations, pondérations, historique        |
| `ADMIN`       | Tout + gestion utilisateurs, cours, sessions, compétences, logs|
