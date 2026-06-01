# API_DOCS — SkillMap FastAPI

> Documentation des endpoints du backend FastAPI.
> Le service tourne sur le port **8000** et n'est pas exposé publiquement.
> Il est accessible uniquement depuis Next.js via le réseau Docker interne.

---

## Authentification

Tous les endpoints sont protégés par une clé API interne partagée entre Next.js et FastAPI.

| Header | Valeur |
|---|---|
| `x-internal-api-key` | Valeur de la variable d'environnement `INTERNAL_API_KEY` |

Toute requête sans cette clé ou avec une clé invalide retourne `401 Unauthorized`.

---

## Endpoints

### `GET /`

Vérifie que le service est opérationnel.

**Authentification requise :** Non

**Réponse `200`**
```json
{
  "message": "SkillMap API opérationnelle"
}
```

---

### `POST /analyze-cv/`

Reçoit un fichier CV (PDF ou Word), extrait le texte brut, appelle le LLM pour structurer les données, et sauvegarde le résultat en base si un `professor-id` est fourni.

**Authentification requise :** Oui (`x-internal-api-key`)

**Content-Type :** `multipart/form-data`

#### Headers

| Header | Type | Requis | Description |
|---|---|---|---|
| `x-internal-api-key` | `string` | ✅ | Clé API interne |
| `professor-id` | `string` | ❌ | UUID du professeur — déclenche la sauvegarde en base |
| `user-id` | `string` | ❌ | UUID de l'utilisateur connecté |

#### Corps (form-data)

| Champ | Type | Requis | Description |
|---|---|---|---|
| `file` | `File` | ✅ | Fichier CV au format PDF ou Word (.docx) |

#### Réponse `200`

```json
{
  "filename": "cv_alice_martin.pdf",
  "extraction_id": "uuid-de-l-extraction-ou-null",
  "saved": true,
  "cv_data": {
    "firstName": "Alice",
    "lastName": "Martin",
    "email": "alice.martin@example.com",
    "phone": "+1 613 555 0101",
    "education": [
      {
        "diploma": "Doctorat en informatique",
        "institution": "Université d'Ottawa",
        "year": 2012,
        "niveauDiplome": "DOCTORATE"
      }
    ],
    "experiences": [
      {
        "position": "Chercheuse IA",
        "organization": "CNRC Ottawa",
        "yearsExp": 6.0,
        "description": "Recherche en apprentissage automatique"
      }
    ],
    "skills": ["Python", "Machine Learning", "Analyse de données"],
    "languages": ["Français", "Anglais"],
    "totalYearsExperience": 12.0
  }
}
```

#### Erreurs

| Code | Description |
|---|---|
| `400` | Format de fichier non supporté (PDF ou .docx uniquement) |
| `401` | Clé API interne invalide ou absente |
| `422` | Impossible d'extraire le texte du fichier |

#### Notes

- Si le LLM est indisponible, un fallback par expressions régulières est utilisé automatiquement (extrait uniquement l'email et le téléphone).
- La sauvegarde en base (`CvExtraction` + `ProfessorSkill`) n'est effectuée que si le header `professor-id` est présent.
- En cas d'échec de la sauvegarde, les données extraites sont quand même retournées.

---

### `POST /calculate-assignments/`

Lance l'algorithme d'affectation pondérée pour une session académique. Calcule un score de compatibilité pour chaque paire (professeur, cours) et retourne toutes les propositions triées par score décroissant.

**Authentification requise :** Oui (`x-internal-api-key`)

**Content-Type :** `application/json`

#### Headers

| Header | Type | Requis | Description |
|---|---|---|---|
| `x-internal-api-key` | `string` | ✅ | Clé API interne |

#### Corps (JSON)

```json
{
  "session_id": "uuid-de-la-session",
  "professors": [...],
  "courses": [...],
  "skills_weight": 0.40,
  "experience_weight": 0.25,
  "education_weight": 0.20,
  "history_weight": 0.15
}
```

| Champ | Type | Requis | Défaut | Description |
|---|---|---|---|---|
| `session_id` | `string` | ✅ | — | UUID de la session académique |
| `professors` | `array` | ✅ | — | Liste des professeurs (voir structure ci-dessous) |
| `courses` | `array` | ✅ | — | Liste des cours (voir structure ci-dessous) |
| `skills_weight` | `float` | ❌ | `0.40` | Poids des compétences (0.0 – 1.0) |
| `experience_weight` | `float` | ❌ | `0.25` | Poids de l'expérience (0.0 – 1.0) |
| `education_weight` | `float` | ❌ | `0.20` | Poids de la formation (0.0 – 1.0) |
| `history_weight` | `float` | ❌ | `0.15` | Poids de l'historique (0.0 – 1.0) |

> ⚠️ La somme des quatre pondérations doit être exactement **1.0**.

#### Structure d'un professeur

```json
{
  "id": "uuid-professeur",
  "firstName": "Alice",
  "lastName": "Martin",
  "skills": [
    { "skillId": "uuid-skill", "niveau": "AVANCE" }
  ],
  "yearsExperience": 12.0,
  "education": [
    { "niveauDiplome": "DOCTORATE" }
  ],
  "history": ["uuid-cours-deja-enseigne"]
}
```

#### Structure d'un cours

```json
{
  "id": "uuid-cours",
  "nom": "Apprentissage automatique",
  "required_skills": [
    {
      "skillId": "uuid-skill",
      "niveauRequis": "INTERMEDIAIRE",
      "poidsCritique": 3
    }
  ]
}
```

#### Valeurs acceptées pour les niveaux

| Champ | Valeurs possibles |
|---|---|
| `niveau` (professeur) | `DEBUTANT`, `INTERMEDIAIRE`, `AVANCE` |
| `niveauRequis` (cours) | `DEBUTANT`, `INTERMEDIAIRE`, `AVANCE` |
| `niveauDiplome` | `DOCTORATE`, `MASTERS`, `BACHELORS`, `DEC`, `OTHER` |

#### Réponse `200`

```json
{
  "session_id": "uuid-de-la-session",
  "total_proposals": 10,
  "assignments": [
    {
      "professor_id": "uuid-professeur",
      "professor_name": "Alice Martin",
      "course_id": "uuid-cours",
      "course_name": "Apprentissage automatique",
      "score": 87.50,
      "score_detail": {
        "skills": 100.0,
        "experience": 100.0,
        "education": 100.0,
        "history": 0.0
      }
    }
  ]
}
```

#### Erreurs

| Code | Description |
|---|---|
| `400` | Liste de professeurs ou de cours vide |
| `400` | Somme des pondérations différente de 1.0 |
| `401` | Clé API interne invalide ou absente |

---

## Algorithme de scoring

Pour chaque paire (professeur, cours), un score final est calculé comme suit :

```
score = (skills_weight × score_compétences)
      + (experience_weight × score_expérience)
      + (education_weight × score_formation)
      + (history_weight × score_historique)
```

| Critère | Calcul |
|---|---|
| **Compétences** | Pour chaque compétence requise : 100% si niveau prof ≥ requis, 50% si inférieur, 0% si absente. Pondéré par `poidsCritique`. |
| **Expérience** | `min(années / 10, 1.0)` — plafonné à 10 ans |
| **Formation** | DOCTORATE=1.0 · MASTERS=0.8 · BACHELORS=0.6 · DEC=0.4 · OTHER=0.2 |
| **Historique** | 1.0 si le professeur a déjà enseigné ce cours, sinon 0.0 |

Le score final est multiplié par 100 et arrondi à 2 décimales.

---

## Variables d'environnement

| Variable | Description | Exemple |
|---|---|---|
| `DATABASE_URL` | URL de connexion PostgreSQL | `postgresql://user:pass@db:5432/skillmap` |
| `LLM_BASE_URL` | URL de base de l'API LLM | `https://defi-informatique.cocalc.cloud/api` |
| `LLM_MODEL` | Modèle LLM à utiliser | `gpt-oss-ctx24k:120b` |
| `LLM_COOKIE` | Cookie d'authentification CoCalc | `FC3yLm9Wyu4Fz7FS` |
| `LLM_API_KEY` | Clé API LLM | `votre_clé` |
| `LLM_TEMPERATURE` | Température du LLM (0.0 – 1.0) | `0.1` |
| `INTERNAL_API_KEY` | Clé partagée Next.js ↔ FastAPI | `changeme` |
| `ALLOWED_ORIGINS` | Origines CORS autorisées | `["http://localhost:3000"]` |
