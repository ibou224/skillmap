# SkillMap — Tâches restantes

> Dernière analyse : 2026-05-26 — Couverture cahier des charges : ~87%

---

## 🔴 CRITIQUE — Bloquant

### 1. Page Pondérations RH manquante

- [ ] Créer `/dashboard/rh/weights/page.jsx` (réutiliser la section ADMIN ou `Weights.jsx`)
- [ ] Corriger le lien sidebar RH : pointe vers `/dashboard/rh/weights` qui n'existe pas


## 🟠 FONCTIONNALITÉS MAJEURES

### 4. Programmes — section et routes manquantes

- [ ] Implémenter `programsSection.jsx` (fichier actuellement vide — 0 octets)
- [ ] Créer l'UI : tableau liste programmes + modale Créer/Modifier
- [ ] Créer `POST /api/programs` — créer un programme
- [ ] Créer `PUT /api/programs/[id]` — modifier un programme
- [ ] Créer `DELETE /api/programs/[id]` — supprimer un programme

### 5. Affectations — fonctionnalités manquantes

- [ ] Exposer l'ajustement manuel dans l'UI : `PATCH /api/affectations/[id]/adjust` existe côté API mais n'est pas utilisé
- [ ] Ajouter un bouton "Finaliser toutes" pour clore en masse les affectations d'une session

### 6. RH — Accès aux affectations

- [ ] Créer `/dashboard/rh/affectations/page.jsx`
- [ ] Vérifier que `/api/affectations` autorise le rôle RH (`requireRole`)

---

## 🟡 AMÉLIORATIONS IMPORTANTES

### 7. Composants Settings — doublons à nettoyer

- [ ] `passeWordSection.jsx` et `PasswordCard.jsx` font la même chose — vérifier lequel est utilisé et supprimer l'autre
- [x] `userInfoSection.jsx` supprimé (fichier mort, remplacé par `ProfileCard.jsx`)

### 8. Page upload CV — à vérifier

- [ ] Vérifier si `/dashboard/professeur/cv/upload/page.jsx` est encore accessible depuis l'UI
- [ ] Si non utilisée, supprimer la page et retirer le lien éventuel

---

## 🔵 NICE TO HAVE (hors scope MVP)

- [ ] Notifications (email ou in-app) lors d'une affectation validée
- [ ] Validation côté client des URLs (linkedin, siteWeb) et du téléphone
- [ ] Tests automatisés (API routes + composants critiques)
- [ ] Photo de profil professeur

---

## ✅ Déjà implémenté

- [x] Auth NextAuth (login / logout / session)
- [x] Dashboard Professeur : accueil, Mon CV (upload + manuel), affectations, compétences, profil, historique CV
- [x] Versioning CV (CvSnapshot, restore, UI HistoriqueCvSection)
- [x] Dashboard Admin : utilisateurs CRUD, cours CRUD + restore, sessions CRUD + activation
- [x] Dashboard Admin : affectations (lancement algo + cycle statut PROPOSEE → AJUSTEE → FINALISEE)
- [x] Dashboard Admin : pondérations configurables par session avec validation somme = 100
- [x] Dashboard Admin : logs d'audit — filtrage client-side, pagination, colonnes Priorité/Action/Message
- [x] Dashboard Admin : tableau de bord avec stats, graphiques, activation sessions (`useHome.js`)
- [x] Dashboard Admin : catalogue de compétences — CRUD complet (SkillsSection + routes GET/POST/PUT/DELETE)
- [x] Dashboard Admin : paramètres compte (ProfileCard + PasswordCard + AccountSettingsSection)
- [x] Dashboard RH : stats accueil, liste CVs + validation
- [x] Backend FastAPI : extract-cv, calculate-assignments
- [x] Algorithme de matching et affectation automatique
- [x] Thème visuel unifié (cite-green) sur toutes les pages
- [x] Audit logs sur toutes les routes critiques (CREATE/UPDATE/DELETE/LOGIN)
- [x] Sécurité routes API : `requireRole` + `getIp` + gestion session sur toutes les routes
- [x] Hooks : `useSkills`, `useSettings`, `useHome`, `useLogs`
- [x] `lib/log_utils.js` — constantes partagées (ACTION_PRIORITY, ENTITY_TYPES)
- [x] Profil professeur : édition indépendante via `PUT /api/professor/profile`
