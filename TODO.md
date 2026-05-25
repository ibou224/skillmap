# SkillMap — Tâches restantes

> Dernière analyse : 2026-05-25

---

## 🔴 CRITIQUE — Bloquant

### 1. Page Pondérations RH manquante
- [ ] Créer `/dashboard/rh/weights/page.jsx` (réutiliser la section ADMIN)
- [ ] Corriger le lien sidebar RH : `/dashboard/rh/weights` (déjà dans sidebar, page manquante)
- [ ] Vérifier que `/api/weights` et `/api/weights/update` sont accessibles au rôle RH

### 2. RH — Accès aux affectations
- [ ] Créer `/dashboard/rh/affectations/page.jsx`
- [ ] Créer une section `RhAffectationSection.jsx` (vue lecture + actions RH)
- [ ] Ajouter l'entrée dans la sidebar RH (`group: "gestion"`)
- [ ] Vérifier que `/api/affectations` autorise le rôle RH (`requireRole`)

---

## 🟠 FONCTIONNALITÉS MAJEURES

### 3. Programmes — ADMIN (section vide)
- [ ] Implémenter `programsSection.jsx` (actuellement 0 lignes)
- [ ] Créer l'UI : tableau liste programmes + bouton Ajouter + modale Créer/Modifier
- [ ] Créer `POST /api/programs` — créer un programme
- [ ] Créer `PUT /api/programs/[id]` — modifier un programme
- [ ] Créer `DELETE /api/programs/[id]` — supprimer/archiver un programme
- [ ] Relier les cours à leur programme dans la vue Admin Cours

### 4. Logs d'audit — ADMIN (section vide)
- [ ] Implémenter `logsSection.jsx` (actuellement 0 lignes)
- [ ] Créer `GET /api/admin/logs` — lister les entrées `AuditLog` avec pagination
- [ ] UI : tableau avec colonnes action / utilisateur / date / détails
- [ ] Ajouter filtres : par rôle, par type d'action, par date

### 5. Paramètres IA — persistance
- [ ] Créer `PUT /api/admin/settings` — sauvegarder config LLM (model, temperature, score_min)
- [ ] Créer `GET /api/admin/settings` — charger la config actuelle
- [ ] Brancher le bouton "Enregistrer" dans `settingsSection.jsx` sur cette API
- [ ] Stocker la config en DB (nouveau modèle `AppSettings` ou table clé-valeur)

### 6. Catalogue de compétences — CRUD ADMIN
- [ ] Créer `POST /api/skills` — ajouter une compétence au catalogue
- [ ] Créer `PUT /api/skills/[id]` — modifier une compétence
- [ ] Créer `DELETE /api/skills/[id]` — supprimer une compétence
- [ ] Créer une UI dans le dashboard Admin pour gérer le catalogue
  - Tableau des compétences existantes
  - Formulaire d'ajout / modale de modification

---

## 🟡 AMÉLIORATIONS IMPORTANTES

### 7. Profil professeur — édition indépendante
- [ ] Créer `PUT /api/professor/profile` — modifier uniquement téléphone / ville / linkedin / siteWeb sans toucher au CV
- [ ] Mettre à jour `ProfilSection.jsx` pour utiliser cette API au lieu du endpoint CV complet

### 8. Nommage endpoint cours
- [ ] Renommer `/api/courses/Add/route.js` → `/api/courses/route.js` (méthode POST)
- [ ] Mettre à jour `useCourses.js` pour appeler `POST /api/courses` au lieu de `/api/courses/Add`

### 9. Page upload CV redondante
- [ ] Vérifier si `/dashboard/professeur/cv/upload/page.jsx` est encore utilisée
- [ ] Si non, supprimer la page et retirer le lien éventuel

---

## 🔵 NICE TO HAVE (hors scope MVP)

- [ ] Export CV en PDF
- [ ] Photo de profil professeur
- [ ] Notifications (email ou in-app) lors d'une affectation validée
- [ ] Validation côté client des URLs (linkedin, siteWeb) et du téléphone
- [ ] Pagination sur la liste des cours et des utilisateurs
- [ ] Tests automatisés (API routes + composants critiques)

---

## ✅ Déjà implémenté

- [x] Auth NextAuth (login / logout / session)
- [x] Dashboard Professeur : accueil, Mon CV (upload + manuel), affectations, compétences, profil, historique CV
- [x] Versioning CV (CvSnapshot, restore, UI HistoriqueCvSection)
- [x] Dashboard Admin : utilisateurs CRUD, cours CRUD + restore, sessions CRUD + activation, affectations, pondérations
- [x] Dashboard RH : stats accueil, liste CVs + validation
- [x] Backend FastAPI : extract-cv, calculate-assignments
- [x] Algorithme de matching et affectation automatique
- [x] Pondérations configurables par session