# SkillMap — Backend (FastAPI)

Service interne d'**extraction de CV par LLM** et d'**algorithme d'affectation pondérée**
des professeurs aux cours. Il est appelé exclusivement par le frontend Next.js via le
réseau Docker interne (non exposé publiquement), authentifié par une clé partagée.

## Stack technique

| Couche             | Technologie                                  |
| ------------------ | -------------------------------------------- |
| Framework          | FastAPI 0.115 + Uvicorn                      |
| Langage            | Python 3.11                                  |
| Accès base         | psycopg2-binary (PostgreSQL)                 |
| Parsing PDF        | PyMuPDF · pdfplumber                         |
| Parsing Word       | python-docx                                  |
| LLM                | Client compatible OpenAI (`openai`)          |
| Validation         | Pydantic 2 + pydantic-settings               |

> La base est interrogée directement en SQL via **psycopg2** (SQLAlchemy/Alembic sont
> présents dans les dépendances mais le schéma est géré côté frontend par **Prisma**).

## Prérequis

- Python 3.11+
- Une base **PostgreSQL** accessible (fournie par Docker Compose en dev — voir le README racine)
- Un accès à l'API LLM (clé fournie par l'équipe)

## Variables d'environnement

Copier `.env.example` en `.env` et renseigner les valeurs :

```env
# ── Base de données ──
# Local (hors Docker) : localhost · En Docker : nom du service (db)
DATABASE_URL=postgresql://admin:SkillMap2026@localhost:5432/skillmap_bd

# ── LLM (compatible OpenAI) ──
LLM_BASE_URL=https://defi-informatique.cocalc.cloud/api
LLM_API_KEY=your_llm_api_key
LLM_COOKIE=your_cocalc_cookie        # si requis par l'hôte LLM
LLM_MODEL=gpt-oss-ctx24k:120b
LLM_TEMPERATURE=0.1

# ── Sécurité ──
# Clé partagée Next.js ↔ FastAPI — DOIT être identique au .env du frontend/racine
INTERNAL_API_KEY=changeme_internal_key

# ── CORS ──
ALLOWED_ORIGINS=["http://localhost:3000"]
```

> En **Docker**, ces variables sont injectées par `docker-compose.yml` ; le fichier `.env`
> local ne sert qu'au développement **hors Docker**.

## Démarrage

### En local (sans Docker)

```bash
cd backend
python -m venv venv
source venv/bin/activate      # macOS / Linux
venv\Scripts\activate         # Windows

pip install -r requirements.txt
cp .env.example .env          # puis renseigner les valeurs

uvicorn app.main:app --reload --port 8000
```

L'API est disponible sur <http://localhost:8000> · documentation interactive sur
<http://localhost:8000/docs> (Swagger généré par FastAPI).

### Avec Docker (recommandé)

Depuis la racine du projet, le service `fastapi` est démarré avec les autres :

```bash
docker compose up -d --build
```

> ⚠️ Le port 8000 n'est **pas** exposé sur l'hôte (`expose` et non `ports`) : FastAPI
> n'est joignable que par Next.js via le réseau Docker interne, pour des raisons de sécurité.

## Endpoints principaux

| Méthode | Chemin                    | Auth                | Description |
| ------- | ------------------------- | ------------------- | ----------- |
| `GET`   | `/`                       | —                   | Message de disponibilité de l'API. |
| `GET`   | `/health`                 | —                   | Health check (utilisé par Docker Compose). |
| `POST`  | `/analyze-cv/`            | `x-internal-api-key`| Reçoit un CV (PDF/DOCX en `multipart/form-data`), extrait le texte, appelle le LLM, sauvegarde et retourne les données structurées. En-têtes additionnels : `professor-id`, `user-id`. |
| `POST`  | `/calculate-assignments/` | `x-internal-api-key`| Lance l'algorithme d'affectation pondérée pour une session et retourne les propositions classées par score décroissant. |

### Corps de `POST /calculate-assignments/`

```json
{
  "session_id": "uuid-session",
  "professors": [ /* ... */ ],
  "courses":    [ /* ... */ ],
  "skills_weight":     0.40,
  "experience_weight": 0.25,
  "education_weight":  0.20,
  "history_weight":    0.15
}
```

> Les pondérations sont comprises entre 0 et 1 et leur somme doit valoir 1.0.
> Toutes les routes métier exigent l'en-tête `x-internal-api-key` (sinon `401`).

## Structure des dossiers

```text
backend/
├── app/
│   ├── main.py            # Point d'entrée FastAPI (CORS + routes)
│   ├── core/
│   │   └── config.py      # Chargement des variables d'environnement (pydantic-settings)
│   ├── api/routes/
│   │   ├── cv.py          # POST /analyze-cv/  (extraction de CV)
│   │   └── assignments.py # POST /calculate-assignments/ (matching)
│   ├── services/
│   │   ├── parser.py      # Extraction de texte PDF/Word
│   │   ├── llm.py         # Appel LLM et structuration des données CV
│   │   ├── matching.py    # Algorithme d'affectation pondérée
│   │   └── database.py    # Accès PostgreSQL (psycopg2)
│   └── models/
│       └── schemas.py     # Schémas Pydantic
├── tests/
│   └── test_matching.py   # Tests de l'algorithme de matching
├── requirements.txt
└── Dockerfile
```

## Tests

```bash
pip install pytest        # non inclus dans requirements.txt
pytest
```
