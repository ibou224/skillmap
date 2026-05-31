# SkillMap

```text
 ____  _    _ _ _ __  __
/ ___|| | _(_) | |  \/  | __ _ _ __
\___ \| |/ / | | | |\/| |/ _` | '_ \
 ___) |   <| | | | |  | | (_| | |_) |
|____/|_|\_\_|_|_|_|  |_|\__,_| .__/
                                |_|
```

> Application web de gestion de CV et d'affectation automatique de professeurs aux cours par intelligence artificielle.

**Défi Informatique La Cité 2026** · **v1.0.0**

![Version](https://img.shields.io/badge/version-1.0.0-6366f1?style=for-the-badge)
![Compétition](https://img.shields.io/badge/Défi_La_Cité-2026-f59e0b?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js&logoColor=white)
![Python](https://img.shields.io/badge/Python-3.11-3776AB?style=for-the-badge&logo=python&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=for-the-badge&logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)

---

## 📋 Table des matières

- [SkillMap](#skillmap)
  - [📋 Table des matières](#-table-des-matières)
  - [🏗️ Architecture](#️-architecture)
  - [🛠️ Stack technique](#️-stack-technique)
  - [✨ Fonctionnalités](#-fonctionnalités)
  - [📦 Prérequis](#-prérequis)
    - [🐳 Docker (recommandé)](#-docker-recommandé)
    - [💻 Installation locale](#-installation-locale)
  - [🚀 Installation](#-installation)
    - [📥 1. Cloner le projet](#-1-cloner-le-projet)
    - [🐳 2. Docker (recommandé)](#-2-docker-recommandé)
    - [🧪 Comptes de test (après Seed)](#-comptes-de-test-après-seed)
    - [💻 Installation locale sans Docker](#-installation-locale-sans-docker)
      - [Backend](#backend)
      - [Frontend](#frontend)
  - [⚙️ Variables d'environnement](#️-variables-denvironnement)

---

## 🏗️ Architecture

```text
┌─────────────────────────────────────────────────┐
│               NAVIGATEUR  (HTTPS)               │
│           JWT via cookies HttpOnly              │
└──────────────────────┬──────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────┐
│           NEXT.JS 14  ·  port 3000              │
│  Auth · API Routes CRUD · Prisma ORM · Uploads  │
└────────┬────────────────────────┬───────────────┘
         │ Prisma ORM             │ HTTP interne Docker
         │              ┌─────────▼───────────────┐
         │              │   FASTAPI  ·  port 8000  │
         │              │  Extraction CV (LLM)     │
         │              │  Algorithme affectation  │
         │              │  SQLAlchemy ORM          │
         │              └─────────┬───────────────┘
┌────────▼────────────────────────▼───────────────┐
│           POSTGRESQL  ·  port 5432              │
└─────────────────────────────────────────────────┘
```

> FastAPI n'est pas exposé publiquement. Il communique exclusivement avec Next.js via le réseau Docker interne.

---

## 🛠️ Stack technique

| Couche | Technologie | Version |
| --- | --- | --- |
| 🎨 Frontend | Next.js + Tailwind CSS | 14 |
| 🔐 Auth & API | Next.js API Routes + NextAuth.js + Prisma | 14 / 5.x |
| 🤖 Backend IA | FastAPI + SQLAlchemy + Alembic | Python 3.11 |
| 🗄️ Base de données | PostgreSQL | 16 |
| 📄 Parsing PDF | pdfplumber | — |
| 📝 Parsing Word | python-docx | — |
| 🧠 LLM | gpt-oss-ctx24k:120B | — |
| 🐳 Déploiement | Docker Compose | — |

---

## ✨ Fonctionnalités

| # | Fonctionnalité | Description |
| --- | --- | --- |
| 01 | 📤 Upload de CV | Formats PDF et Word supportés |
| 02 | 🤖 Extraction IA | Détection automatique des compétences via LLM |
| 03 | ⚖️ Affectation pondérée | Algorithme configurable par critères |
| 04 | 👥 Gestion des rôles | Professeur · Responsable RH · Administrateur |
| 05 | 📊 Historique | Suivi des affectations par session |
| 06 | 🔒 Authentification | JWT sécurisé via cookies HttpOnly |

---

## 📦 Prérequis

### 🐳 Docker (recommandé)

- Docker 24+
- Docker Compose v2+

### 💻 Installation locale

- Node.js 20+
- Python 3.11+
- PostgreSQL 16+

---

## 🚀 Installation

### 📥 1. Cloner le projet

Commencez par récupérer le code source sur votre machine en utilisant Git :

```bash
git clone <URL_DU_DEPOT_GIT>
cd skillmap
```

### 🐳 2. Docker (recommandé)

```bash
# 1. Copier le fichier d'exemple des variables d'environnement
cp .env.example .env

# 2. Construire et démarrer tous les services en arrière-plan
docker compose up -d --build

# 3. Synchroniser la base de données locale (depuis le conteneur frontend)
docker compose exec nextjs npx prisma db push

# 4. Remplir la base de données avec le jeu de données initial
docker compose exec nextjs npx prisma db seed
```

Une fois lancé, les services sont accessibles aux adresses suivantes :

| Service | URL |
| --- | --- |
| 🌐 Application (Frontend) | <http://localhost:3000> |
| ⚡ API FastAPI (Backend IA) | interne à Docker |
| 🗄️ PostgreSQL (Local Db) | `localhost:5432` |

> **⚠️ En cas d'erreur `Next.js package not found` / Turbopack au lancement :**
> Exécutez la commande `docker compose rm -s -v -f nextjs && docker compose up -d --build nextjs` pour nettoyer le cache corrompu.

### 🧪 Comptes de test (après Seed)

Le script de seed (`npx prisma db seed`) crée automatiquement des comptes pour tester l'application :

- **Admin** : `admin@lacitec.on.ca` — _Mot de passe : `Admin1234!`_
- **RH** : `rh@lacitec.on.ca` — _Mot de passe : `RhSkillMap1!`_
- **Professeur (test)** : `prof@lacitec.on.ca` — _Mot de passe : `Prof1234!`_
- **Autres professeurs (générés)** : ex: `marc.tremblay@lacitec.on.ca` — _Mot de passe : `Prof@2026!`_

### 💻 Installation locale sans Docker

⚠️ **Important : Base de données**  
Sans Docker, la base de données PostgreSQL n'est pas instanciée automatiquement. Vous devrez fournir votre propre instance pour que l'application fonctionne :
1. Soit **installer PostgreSQL localement** sur votre ordinateur (via l'installateur officiel).
2. Soit **utiliser une base Cloud gratuite** comme Supabase, Neon.tech ou Render.
3. Soit **démarrer uniquement la DB via Docker** depuis la racine du projet, avec la commande `docker compose up -d db`.

*N'oubliez pas d'indiquer l'adresse de cette base de données dans la variable `DATABASE_URL` de votre fichier `.env`.*

#### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate      # macOS / Linux
venv\Scripts\activate         # Windows

pip install -r requirements.txt
cp .env.example .env
uvicorn main:app --reload --port 8000
```

#### Frontend

```bash
cd frontend
npm install
cp .env.local.example .env.local
npx prisma migrate dev
npm run dev
```

---

## ⚙️ Variables d'environnement

Copier `.env.example` en `.env` (à la racine) et renseigner les valeurs. 
Pour faciliter les tests locaux (sans risque de sécurité), voici les valeurs recommandées à utiliser :

| Variable | Description | Valeur recommandée / de test (Local) |
| --- | --- | --- |
| `POSTGRES_USER` | Utilisateur PostgreSQL | `admin` |
| `POSTGRES_PASSWORD` | Mot de passe PostgreSQL | `SkillMap2026` |
| `POSTGRES_DB` | Nom de la base de données | `skillmap_bd` |
| `NEXTAUTH_SECRET` | Secret de session (JWT) | `secret-local-skillmap-2026-lacite` |
| `NEXTAUTH_URL` | URL publique de l'application | `http://localhost:3000` |
| `LLM_API_URL` | URL de l'API globale du LLM | _[Dépend de votre modèle LLM]_ |
| `LLM_API_KEY` | Clé d'accès à l'API LLM | 🛑 **[Sensible : Demander la clé à l'équipe]** |
| `INTERNAL_API_KEY` | Clé partagée Next.js ↔ FastAPI | `cle-interne-securite-docker` |
| `PGADMIN_EMAIL` | Email de connexion pgAdmin | `admin@lacitec.on.ca` |
| `PGADMIN_PASSWORD` | Mot de passe pgAdmin | `admin` |

---

Fait avec ❤️ pour le **Défi Informatique La Cité 2026**
