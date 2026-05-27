# SkillMap — Frontend

Application de gestion des affectations d'enseignants, construite avec Next.js 16 App Router.

## Stack technique

| Couche          | Technologie                       |
| --------------- | --------------------------------- |
| Framework       | Next.js 16.2 (App Router)         |
| Authentification| NextAuth v5 (beta)                |
| Base de données | PostgreSQL 16 + Prisma 7          |
| Styles          | Tailwind CSS v4                   |
| Backend IA      | FastAPI (service interne Docker)  |
| Tests           | Vitest                            |

## Prérequis

- Node.js 20+
- Docker + Docker Compose (pour PostgreSQL et FastAPI)
- Fichier `.env.local` configuré (voir `.env.example`)

## Démarrage

### Avec Docker (recommandé)

```bash
# Depuis la racine du projet (dossier parent de frontend/)
docker compose up -d
```

Services lancés :

- `http://localhost:3000` — Next.js
- `http://localhost:8000` — FastAPI (algorithme d'affectation)
- `http://localhost:5432` — PostgreSQL
- `http://localhost:5050` — pgAdmin

### En local (développement)

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

Créer un fichier `.env.local` à la racine de `frontend/` :

```env
DATABASE_URL=postgresql://user:password@localhost:5432/skillmap
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=http://localhost:3000
FASTAPI_INTERNAL_URL=http://localhost:8000
INTERNAL_API_KEY=your-api-key-here
```

## Architecture

```text
src/
├── app/              # Routes Next.js (App Router) — pages et API routes
│   ├── api/          # Routes API (auth, affectations, weights, history…)
│   └── dashboard/    # Pages dashboard (admin, rh, professeur)
├── features/         # Sections métier (une par page, usage unique)
├── components/       # Composants UI réutilisables
│   ├── ui/           # Composants génériques (boutons, modales…)
│   ├── layout/       # Sidebar, Header
│   └── professeur/   # Composants spécifiques au rôle professeur
├── hooks/            # Hooks React (fetch, état)
├── lib/              # Utilitaires (prisma, auth, permissions, formatData)
└── constants/        # Constantes partagées (statuts, CRUD options)
```

## Rôles utilisateur

| Rôle          | Accès                                                          |
| ------------- | -------------------------------------------------------------- |
| `PROFESSEUR`  | Son profil, CV, compétences, affectations                      |
| `RH`          | CVs professeurs, affectations, pondérations, historique        |
| `ADMIN`       | Tout + gestion utilisateurs, cours, sessions, compétences, logs|
