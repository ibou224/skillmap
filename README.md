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

- [🏗️ Architecture](#️-architecture)
- [🛠️ Stack technique](#️-stack-technique)
- [✨ Fonctionnalités](#-fonctionnalités)
- [📦 Prérequis](#-prérequis)
- [🚀 Installation](#-installation)
  - [Docker (recommandé)](#docker-recommandé)
  - [Installation locale](#installation-locale)
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
| 🎨 Frontend | Next.js + Tailwind CSS + shadcn/ui | 14 |
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

### Docker (recommandé)

```bash
# 1. Configurer les variables d'environnement
cp .env.example .env

# 2. Démarrer tous les services
docker compose up -d
```

Une fois lancé, les services sont accessibles aux adresses suivantes :

| Service | URL |
| --- | --- |
| 🌐 Application | <http://localhost:3000> |
| ⚡ API FastAPI | <http://localhost:8000> |
| 🗄️ pgAdmin | <http://localhost:5050> |

### Installation locale

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

Copier `.env.example` en `.env` et renseigner les valeurs suivantes :

| Variable | Description |
| --- | --- |
| `POSTGRES_USER` | Utilisateur PostgreSQL |
| `POSTGRES_PASSWORD` | Mot de passe PostgreSQL |
| `POSTGRES_DB` | Nom de la base de données |
| `NEXTAUTH_SECRET` | Secret NextAuth — générer avec `openssl rand -base64 32` |
| `NEXTAUTH_URL` | URL publique de l'application |
| `LLM_API_URL` | URL de l'API LLM |
| `LLM_API_KEY` | Clé d'authentification LLM |
| `INTERNAL_API_KEY` | Clé partagée Next.js ↔ FastAPI |
| `PGADMIN_EMAIL` | Email de connexion pgAdmin |
| `PGADMIN_PASSWORD` | Mot de passe pgAdmin |

---

Fait avec ❤️ pour le **Défi Informatique La Cité 2026**
