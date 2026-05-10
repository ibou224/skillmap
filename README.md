# SkillMap 🎯

> Application web intelligente de gestion de CV et d'affectation automatique de professeurs aux cours via intelligence artificielle.

**Compétition Défi Informatique La Cité 2026**

---

## Stack technique

| Couche | Technologie |
|---|---|
| Frontend | Next.js 14 + TypeScript + Tailwind CSS |
| Backend IA | FastAPI (Python 3.11) |
| Base de données | Supabase (PostgreSQL) |
| Auth | Supabase Auth + JWT |
| LLM | gpt-oss-ctx24k:120B |
| Parsing PDF | pdfplumber |
| Parsing Word | python-docx |

---

## Fonctionnalités

- 📄 Upload de CV (PDF et Word)
- 🤖 Extraction automatique des compétences via LLM
- ⚖️ Algorithme d'affectation pondérée configurable
- 👥 3 rôles : Professeur, Responsable RH, Administrateur
- 📊 Historique des affectations par session
- 🔐 Authentification sécurisée avec JWT

---

## Installation

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # macOS/Linux
venv\Scripts\activate     # Windows
pip install -r requirements.txt
cp .env.example .env
python -m uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```
