# SkillMap - Taches restantes

> Derniere analyse : 2026-05-27
> Estimation MVP : ~91% selon le cahier de conception.

---

## Accompli âœ…

- [x] Page PondÃ©rations RH (`/dashboard/rh/weights`) crÃ©Ã©e et fonctionnelle.
- [x] Cookies NextAuth : `httpOnly`, `sameSite`, `secure` configurÃ©s explicitement dans `auth.js`.
- [x] Expiration d'inactivitÃ© : `useIdleTimeout` (30 min) branchÃ© sur `DashboardShell`.
- [x] `useIdleTimeout` dÃ©placÃ© de `layout.js` (Server Component) vers `DashboardShell` (Client Component).
- [x] Confirmations avant suppressions : `ConfirmModal` prÃ©sent sur users, sessions, cours, dÃ©connexion.
- [x] Ã‰tats vides Programmes : section reconstruite avec liste + Ã©tat vide illustrÃ© + call-to-action.
- [x] Responsive mobile : sidebar en overlay + backdrop + bouton hamburger dans le header.
- [x] `RefreshTokenError` : banniÃ¨re compte Ã  rebours 5 s avant redirect `/login`.

---

## Critique - Bloquant avant dÃ©mo / production

### 1. Mauvaise variable d'environnement pour FastAPI

- [ ] Dans `frontend/src/app/api/affectations/analyze/route.js`, remplacer `BACKEND_URL` par `FASTAPI_INTERNAL_URL` (Docker injecte `FASTAPI_INTERNAL_URL`, pas `BACKEND_URL`).
- [ ] Harmoniser le nom dans `.env`, `.env.example` et `docker-compose.yml`.
- [ ] VÃ©rifier que l'endpoint appelÃ© est bien `/calculate-assignments/` (FastAPI) et non `/calculate-assignments/run`.
- [ ] Ajouter une gestion d'erreur claire si FastAPI est indisponible (catch explicite + message affichÃ© dans l'UI).

### 2. FastAPI exposÃ© publiquement

- [ ] Dans `docker-compose.yml`, changer `"8000:8000"` en `"127.0.0.1:8000:8000"` pour bloquer l'accÃ¨s direct depuis l'extÃ©rieur.
- [ ] VÃ©rifier que `INTERNAL_API_KEY` est bien obligatoire sur `/analyze-cv/` ET `/calculate-assignments/`.

### 3. Secrets dans `.env.example`

- [ ] `frontend/.env.example` contient de vraies valeurs (`DATABASE_URL` avec mot de passe, `NEXTAUTH_SECRET` rÃ©el) â€” les remplacer par des placeholders (`<YOUR_SECRET>`).
- [ ] VÃ©rifier que `frontend/.env` n'a jamais Ã©tÃ© commitÃ© (`git log --all -- "frontend/.env"`).
- [ ] Ajouter `NEXTAUTH_URL=https://votre-domaine.com` dans `.env.example` (requis pour que `secure: true` fonctionne en production).

### 4. Programmes - CRUD incomplet

- [x] Implémenter `frontend/src/features/admin/programsSection.jsx` (fichier actuellement vide — 1 seule ligne).
- [x] Créer l'UI : tableau avec recherche, création, modification, suppression.
- [x] Ajouter `POST /api/programs` (route actuelle = GET uniquement).
- [x] Ajouter `PUT /api/programs/[id]` et `DELETE /api/programs/[id]`.
- [x] Ajouter validation serveur : code unique, nom requis, `nbEtapes` valide (entier > 0).
- [x] Ajouter logs d'audit sur CREATE / UPDATE / DELETE programme.

---

## Important - Non bloquant

### 5. Tests

- [ ] Ajouter tests unitaires pour `matching.py` (FastAPI) : scores par critÃ¨re, edge cases (0 prof, 0 cours, poids Ã  0).
- [ ] Ajouter test pour `POST /api/affectations/analyze` avec mock FastAPI (retour valide + FastAPI down).
- [ ] Ajouter tests e2e (Playwright) : login â†’ upload CV â†’ validation â†’ lancement affectations â†’ finalisation.
- [ ] ComplÃ©ter la couverture de `formatData.test.js` : cas limites (sessions sans pondÃ©rations, profs sans compÃ©tences).

### 6. SÃ©curitÃ© complÃ©mentaire

- [ ] Ajouter rate limiting global sur les routes sensibles (`/api/affectations/analyze`, `/api/admin/*`) â€” actuellement seul `/login` est protÃ©gÃ© (5 tentatives).
- [ ] VÃ©rifier que `session.maxAge` (7 jours) est alignÃ© avec le cahier des charges.
- [ ] Valider que le payload JWT ne contient pas de donnÃ©es sensibles exposables cÃ´tÃ© client.

### 7. Robustesse FastAPI

- [ ] Ajouter un healthcheck Docker sur le service `fastapi` (comme `db` a `pg_isready`).
- [ ] Tester le fallback regex quand le LLM est indisponible : vÃ©rifier que le rÃ©sultat est cohÃ©rent et non vide.
- [ ] Ajouter un timeout explicite sur l'appel HTTP vers `FASTAPI_INTERNAL_URL` cÃ´tÃ© Next.js (Ã©viter hang infini si FastAPI freeze).

### 8. UX et finition

- [x] Ajouter Ã©tats vides utiles sur la section Programmes (illustration + call-to-action "CrÃ©er un programme").
- [x] Ajouter confirmations (`Dialog`) avant suppressions et actions irrÃ©versibles (programmes, utilisateurs, sessions archivÃ©es).
- [x] VÃ©rifier responsive mobile / tablette sur tous les dashboards (sidebar, tableaux, formulaires).
- [x] GÃ©rer le cas `RefreshTokenError` dans l'UI : afficher un message explicite avant redirect `/login` plutÃ´t qu'une redirection silencieuse.

---

## Nice to have - Hors MVP

- [ ] Notifications email ou in-app lors d'une affectation finalisÃ©e.
- [ ] Export CSV / PDF des rÃ©sultats d'affectation par session.
- [ ] Photo de profil professeur (upload + stockage objet).
- [ ] Tableau de bord analytique avancÃ© pour RH / Admin (graphiques, tendances par session).
- [ ] Pagination serveur sur les grandes listes (cours, utilisateurs, logs).
- [ ] Validation client avancÃ©e : numÃ©ro de tÃ©lÃ©phone, URL LinkedIn, site web.
- [ ] Support MFA / 2FA (TOTP ou code email).

