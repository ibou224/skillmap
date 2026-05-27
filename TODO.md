# SkillMap - Taches restantes

> Derniere analyse : 2026-05-26
> Estimation MVP : ~88-90% selon le cahier de conception.

---

## Critique - Bloquant

### 2. Mauvaise variable d'environnement pour FastAPI

- [ ] Dans `frontend/src/app/api/affectations/analyze/route.js`, le code utilise `BACKEND_URL` alors que Docker injecte `FASTAPI_INTERNAL_URL`.
- [ ] Remplacer `BACKEND_URL` par `FASTAPI_INTERNAL_URL` (ou harmoniser les deux dans `.env` et `docker-compose.yml`).
- [ ] Verifier que l'endpoint appele est bien `/calculate-assignments/` (FastAPI) et non `/calculate-assignments/run`.
- [ ] Ajouter une gestion d'erreur claire si FastAPI est indisponible.

### 3. FastAPI expose publiquement

- [ ] Dans `docker-compose.yml`, changer `"8000:8000"` en `"127.0.0.1:8000:8000"` pour bloquer l'acces externe.
- [ ] Verifier que `INTERNAL_API_KEY` est obligatoire sur toutes les routes FastAPI sensibles.

---

## Fonctionnalites majeures

### 4. Page Ponderations RH manquante

- [ ] Creer `frontend/src/app/dashboard/rh/weights/page.jsx`.
- [ ] Reutiliser `features/weights/WeightsConfigPage` (deja utilise par l'admin, les permissions API autorisent deja RH).
- [ ] Verifier que le lien sidebar RH `/dashboard/rh/weights` fonctionne apres creation.

### 5. Programmes - CRUD incomplet

- [ ] Implementer `frontend/src/features/admin/programsSection.jsx` (fichier vide).
- [ ] Creer l'UI : tableau, recherche, creation, modification, suppression.
- [ ] Ajouter `POST /api/programs` pour creer un programme (route actuelle = GET uniquement).
- [ ] Ajouter `PUT /api/programs/[id]` et `DELETE /api/programs/[id]`.
- [ ] Ajouter validation serveur : code unique, nom requis, etapes valide.
- [ ] Ajouter logs d'audit sur CREATE/UPDATE/DELETE programme.

---

## Securite et conformite

### 8. CSRF, cookies et production

- [ ] Verifier la configuration NextAuth en production : cookies Secure, HttpOnly, SameSite.
- [ ] Verifier l'expiration d'inactivite demandee par le cahier.
- [ ] Verifier que les secrets obligatoires sont absents du repo et documentes dans `.env.example`.

### 12. Tests automatises

- [ ] Ajouter tests unitaires pour l'algorithme de matching/scoring.
- [ ] Ajouter tests e2e : login -> upload CV -> validation -> lancement affectations -> finalisation.

### 14. UX et finition

- [ ] Ajouter etats vides utiles sur les sections encore manquantes (programmes).
- [ ] Ajouter confirmations avant suppressions et actions irreversibles (programmes, utilisateurs).
- [ ] Verifier responsive mobile/tablette sur les dashboards.

---

## Nice to have - Hors MVP

- [ ] Notifications email ou in-app lors d'une affectation finalisee.
- [ ] Photo de profil professeur.
- [ ] Export Excel en plus du CSV/PDF.
- [ ] Tableau de bord analytique plus avance pour RH/Admin.
- [ ] Pagination serveur sur les grandes listes.
- [ ] Validation client avancee : telephone, LinkedIn, site web.