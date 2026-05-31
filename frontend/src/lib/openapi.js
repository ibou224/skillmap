/**
 * @module lib/openapi
 * @description Spécification OpenAPI 3.0.3 décrivant l'ensemble des routes API
 * Next.js de SkillMap. Servie par la route /api/openapi et consommée par
 * Swagger UI (/api-docs). Contient également des helpers de fabrique de réponses.
 */

/** Contenu JSON générique réutilisé dans les définitions de réponses. */
const json = {
  "application/json": {
    schema: {
      type: "object",
    },
  },
};

/**
 * Construit un objet de réponse OpenAPI 200 avec corps JSON générique.
 * @param {string} [description="Operation reussie"] Description de la réponse.
 * @returns {Object} Objet réponse OpenAPI.
 */
const successResponse = (description = "Operation reussie") => ({
  description,
  content: json,
});

/** Réponses d'erreur standard réutilisables (400/401/403/404/409/500). */
const errorResponses = {
  400: { description: "Requete invalide" },
  401: { description: "Authentification requise" },
  403: { description: "Acces refuse" },
  404: { description: "Ressource introuvable" },
  409: { description: "Conflit metier" },
  500: { description: "Erreur serveur" },
};

/**
 * Construit un `requestBody` OpenAPI au format application/json.
 * @param {Object} schema           Schéma JSON du corps de requête.
 * @param {boolean} [required=true] Indique si le corps est obligatoire.
 * @returns {Object} Objet requestBody OpenAPI.
 */
const jsonBody = (schema, required = true) => ({
  required,
  content: {
    "application/json": {
      schema,
    },
  },
});

/**
 * Construit un paramètre de chemin (path) OpenAPI de type chaîne.
 * @param {string} [name="id"]                              Nom du paramètre.
 * @param {string} [description="Identifiant de la ressource"] Description du paramètre.
 * @returns {Object} Objet parameter OpenAPI.
 */
const idParam = (name = "id", description = "Identifiant de la ressource") => ({
  name,
  in: "path",
  required: true,
  description,
  schema: { type: "string" },
});

/**
 * Document OpenAPI 3.0.3 complet de l'API SkillMap (info, serveurs, tags,
 * schémas de composants réutilisables et description de tous les chemins).
 * @type {Object}
 */
export const openApiSpec = {
  openapi: "3.0.3",
  info: {
    title: "SkillMap API",
    version: "1.0.0",
    description:
      "Documentation OpenAPI des routes Next.js de SkillMap. Les routes protegees utilisent les cookies de session NextAuth.",
  },
  servers: [
    {
      url: "http://localhost:3000",
      description: "Developpement local Next.js",
    },
  ],
  tags: [
    { name: "Auth", description: "Authentification NextAuth" },
    { name: "Admin", description: "Routes d'administration" },
    { name: "Affectations", description: "Analyse, ajustement et finalisation des affectations" },
    { name: "Courses", description: "Gestion des cours" },
    { name: "CV", description: "Extraction, validation et snapshots CV" },
    { name: "Programs", description: "Programmes academiques" },
    { name: "RH", description: "Routes RH" },
    { name: "Sessions", description: "Sessions academiques" },
    { name: "Settings", description: "Parametres du compte" },
    { name: "Skills", description: "Competences" },
    { name: "Users", description: "Utilisateurs et profil professeur" },
    { name: "Weights", description: "Ponderations de l'algorithme" },
  ],
  components: {
    securitySchemes: {
      nextAuthCookie: {
        type: "apiKey",
        in: "cookie",
        name: "authjs.session-token",
        description:
          "Cookie de session NextAuth. En HTTPS/prod, le nom peut etre prefixe par __Secure-.",
      },
    },
    schemas: {
      ApiSuccess: {
        type: "object",
        properties: {
          success: { type: "boolean" },
          data: {},
          message: { type: "string" },
        },
      },
      ApiError: {
        type: "object",
        properties: {
          success: { type: "boolean", example: false },
          message: { type: "string" },
          error: { type: "string" },
        },
      },
      AssignmentStatus: {
        type: "string",
        enum: ["PROPOSEE", "AJUSTEE", "FINALISEE"],
      },
      Role: {
        type: "string",
        enum: ["PROFESSEUR", "RH", "ADMIN"],
      },
      SkillLevel: {
        type: "string",
        enum: ["DEBUTANT", "INTERMEDIAIRE", "AVANCE"],
      },
      SessionStatus: {
        type: "string",
        enum: ["PLANIFIEE", "ACTIVE", "ARCHIVEE"],
      },
    },
  },
  security: [{ nextAuthCookie: [] }],
  paths: {
    "/api/openapi": {
      get: {
        tags: ["Admin"],
        security: [],
        summary: "Retourne la specification OpenAPI de l'API Next.js",
        responses: {
          200: successResponse("Specification OpenAPI"),
        },
      },
    },
    "/api/auth/{nextauth}": {
      get: {
        tags: ["Auth"],
        security: [],
        summary: "Routes GET internes de NextAuth",
        parameters: [idParam("nextauth", "Segment dynamique NextAuth")],
        responses: {
          200: successResponse(),
        },
      },
      post: {
        tags: ["Auth"],
        security: [],
        summary: "Routes POST internes de NextAuth",
        parameters: [idParam("nextauth", "Segment dynamique NextAuth")],
        responses: {
          200: successResponse(),
          ...errorResponses,
        },
      },
    },
    "/api/admin/logs": {
      get: {
        tags: ["Admin"],
        summary: "Liste les logs d'audit",
        description: "Role requis : ADMIN.",
        responses: {
          200: successResponse("Logs d'audit"),
          ...errorResponses,
        },
      },
    },
    "/api/admin/users": {
      get: {
        tags: ["Admin", "Users"],
        summary: "Liste les utilisateurs",
        description: "Role requis : ADMIN.",
        responses: {
          200: successResponse("Liste des utilisateurs"),
          ...errorResponses,
        },
      },
    },
    "/api/admin/users/create": {
      post: {
        tags: ["Admin", "Users"],
        summary: "Cree un utilisateur",
        description: "Role requis : ADMIN.",
        requestBody: jsonBody({
          type: "object",
          required: ["email", "password", "nom", "prenom", "role"],
          properties: {
            email: { type: "string", format: "email" },
            password: { type: "string", format: "password" },
            nom: { type: "string" },
            prenom: { type: "string" },
            role: { $ref: "#/components/schemas/Role" },
          },
        }),
        responses: {
          201: successResponse("Utilisateur cree"),
          ...errorResponses,
        },
      },
    },
    "/api/admin/users/{id}": {
      put: {
        tags: ["Admin", "Users"],
        summary: "Modifie un utilisateur",
        description: "Role requis : ADMIN.",
        parameters: [idParam()],
        requestBody: jsonBody({
          type: "object",
          properties: {
            email: { type: "string", format: "email" },
            nom: { type: "string" },
            prenom: { type: "string" },
            role: { $ref: "#/components/schemas/Role" },
            isActive: { type: "boolean" },
          },
        }),
        responses: {
          200: successResponse("Utilisateur modifie"),
          ...errorResponses,
        },
      },
      delete: {
        tags: ["Admin", "Users"],
        summary: "Supprime ou desactive un utilisateur",
        description: "Role requis : ADMIN.",
        parameters: [idParam()],
        responses: {
          200: successResponse("Utilisateur supprime/desactive"),
          ...errorResponses,
        },
      },
    },
    "/api/admin/users/delete": {
      delete: {
        tags: ["Admin", "Users"],
        summary: "Supprime un utilisateur via le corps de requete",
        description: "Role requis : ADMIN.",
        requestBody: jsonBody({
          type: "object",
          required: ["id"],
          properties: { id: { type: "string" } },
        }),
        responses: {
          200: successResponse("Utilisateur supprime"),
          ...errorResponses,
        },
      },
    },
    "/api/admin/courses/{id}": {
      put: {
        tags: ["Admin", "Courses"],
        summary: "Modifie un cours cote admin",
        description: "Role requis : ADMIN.",
        parameters: [idParam()],
        responses: {
          200: successResponse("Cours modifie"),
          ...errorResponses,
        },
      },
      delete: {
        tags: ["Admin", "Courses"],
        summary: "Archive un cours cote admin",
        description: "Role requis : ADMIN.",
        parameters: [idParam()],
        responses: {
          200: successResponse("Cours archive"),
          ...errorResponses,
        },
      },
    },
    "/api/users": {
      get: {
        tags: ["Users"],
        summary: "Recupere le profil complet du professeur connecte",
        description: "Role requis : PROFESSEUR.",
        responses: {
          200: successResponse("Profil professeur"),
          ...errorResponses,
        },
      },
    },
    "/api/settings": {
      patch: {
        tags: ["Settings"],
        summary: "Met a jour les informations de profil du compte connecte",
        responses: {
          200: successResponse("Profil mis a jour"),
          ...errorResponses,
        },
      },
      put: {
        tags: ["Settings"],
        summary: "Met a jour le mot de passe du compte connecte",
        responses: {
          200: successResponse("Mot de passe mis a jour"),
          ...errorResponses,
        },
      },
    },
    "/api/skills": {
      get: {
        tags: ["Skills"],
        security: [],
        summary: "Liste les competences",
        responses: {
          200: successResponse("Liste des competences"),
          ...errorResponses,
        },
      },
      post: {
        tags: ["Skills"],
        summary: "Cree une competence",
        description: "Role requis : ADMIN.",
        requestBody: jsonBody({
          type: "object",
          required: ["nom", "categorie"],
          properties: {
            nom: { type: "string" },
            categorie: { type: "string" },
            description: { type: "string" },
          },
        }),
        responses: {
          201: successResponse("Competence creee"),
          ...errorResponses,
        },
      },
    },
    "/api/skills/{id}": {
      put: {
        tags: ["Skills"],
        summary: "Modifie une competence",
        description: "Role requis : ADMIN.",
        parameters: [idParam()],
        requestBody: jsonBody({
          type: "object",
          properties: {
            nom: { type: "string" },
            categorie: { type: "string" },
            description: { type: "string" },
          },
        }),
        responses: {
          200: successResponse("Competence modifiee"),
          ...errorResponses,
        },
      },
      delete: {
        tags: ["Skills"],
        summary: "Supprime une competence",
        description: "Role requis : ADMIN.",
        parameters: [idParam()],
        responses: {
          200: successResponse("Competence supprimee"),
          ...errorResponses,
        },
      },
    },
    "/api/programs": {
      get: {
        tags: ["Programs"],
        security: [],
        summary: "Liste les programmes",
        responses: {
          200: successResponse("Liste des programmes"),
          ...errorResponses,
        },
      },
    },
    "/api/courses": {
      get: {
        tags: ["Courses"],
        summary: "Liste les cours ou programmes",
        description: "Role requis : ADMIN ou RH. Avec `?programs=true`, retourne les programmes lies aux cours.",
        parameters: [
          {
            name: "programs",
            in: "query",
            required: false,
            schema: { type: "boolean" },
          },
        ],
        responses: {
          200: successResponse("Liste des cours ou programmes"),
          ...errorResponses,
        },
      },
    },
    "/api/courses/add": {
      post: {
        tags: ["Courses"],
        summary: "Cree un cours",
        description: "Role requis : ADMIN ou RH.",
        requestBody: jsonBody({
          type: "object",
          required: ["nom", "code", "etape", "programIds"],
          properties: {
            nom: { type: "string" },
            code: { type: "string" },
            etape: { type: "integer" },
            programIds: { type: "array", items: { type: "string" } },
            courseSkills: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  skillId: { type: "string" },
                  niveauRequis: { $ref: "#/components/schemas/SkillLevel" },
                  poidsCritique: { type: "integer" },
                },
              },
            },
          },
        }),
        responses: {
          201: successResponse("Cours cree"),
          ...errorResponses,
        },
      },
    },
    "/api/courses/{id}": {
      put: {
        tags: ["Courses"],
        summary: "Modifie un cours",
        description: "Role requis : ADMIN.",
        parameters: [idParam()],
        responses: {
          200: successResponse("Cours modifie"),
          ...errorResponses,
        },
      },
      delete: {
        tags: ["Courses"],
        summary: "Archive un cours",
        description: "Role requis : ADMIN.",
        parameters: [idParam()],
        responses: {
          200: successResponse("Cours archive"),
          ...errorResponses,
        },
      },
    },
    "/api/courses/{id}/restore": {
      post: {
        tags: ["Courses"],
        summary: "Restaure un cours archive",
        description: "Role requis : ADMIN ou RH.",
        parameters: [idParam()],
        responses: {
          200: successResponse("Cours restaure"),
          ...errorResponses,
        },
      },
    },
    "/api/sessions": {
      get: {
        tags: ["Sessions"],
        summary: "Liste les sessions",
        description: "Role requis : ADMIN ou RH.",
        responses: {
          200: successResponse("Liste des sessions"),
          ...errorResponses,
        },
      },
      post: {
        tags: ["Sessions"],
        summary: "Cree une session",
        description: "Role requis : ADMIN ou RH.",
        requestBody: jsonBody({
          type: "object",
          properties: {
            nom: { type: "string" },
            annee: { type: "integer" },
            periode: { type: "string", enum: ["AUTOMNE", "HIVER", "ETE", "PRINTEMPS"] },
            dateDebut: { type: "string", format: "date-time" },
            dateFin: { type: "string", format: "date-time" },
          },
        }),
        responses: {
          201: successResponse("Session creee"),
          ...errorResponses,
        },
      },
    },
    "/api/sessions/{id}": {
      get: {
        tags: ["Sessions"],
        summary: "Recupere une session",
        description: "Role requis : ADMIN ou RH.",
        parameters: [idParam()],
        responses: {
          200: successResponse("Session"),
          ...errorResponses,
        },
      },
      put: {
        tags: ["Sessions"],
        summary: "Modifie une session",
        description: "Role requis : ADMIN ou RH.",
        parameters: [idParam()],
        responses: {
          200: successResponse("Session modifiee"),
          ...errorResponses,
        },
      },
      delete: {
        tags: ["Sessions"],
        summary: "Supprime une session",
        description: "Role requis : ADMIN ou RH.",
        parameters: [idParam()],
        responses: {
          200: successResponse("Session supprimee"),
          ...errorResponses,
        },
      },
    },
    "/api/sessions/{id}/activate": {
      put: {
        tags: ["Sessions"],
        summary: "Active une session",
        description: "Role requis : ADMIN ou RH. Archive les autres sessions actives.",
        parameters: [idParam()],
        responses: {
          200: successResponse("Session activee"),
          ...errorResponses,
        },
      },
    },
    "/api/weights": {
      get: {
        tags: ["Weights"],
        summary: "Liste ou recupere les ponderations",
        description: "Role requis : ADMIN ou RH.",
        responses: {
          200: successResponse("Ponderations"),
          ...errorResponses,
        },
      },
    },
    "/api/weights/update": {
      put: {
        tags: ["Weights"],
        summary: "Met a jour les ponderations d'une session",
        description: "Role requis : ADMIN ou RH. La somme doit etre egale a 100.",
        requestBody: jsonBody({
          type: "object",
          required: ["sessionId", "competencesPct", "experiencePct", "formationPct", "historiquePct"],
          properties: {
            sessionId: { type: "string" },
            competencesPct: { type: "integer" },
            experiencePct: { type: "integer" },
            formationPct: { type: "integer" },
            historiquePct: { type: "integer" },
          },
        }),
        responses: {
          200: successResponse("Ponderations mises a jour"),
          ...errorResponses,
        },
      },
    },
    "/api/affectations": {
      get: {
        tags: ["Affectations"],
        summary: "Liste les affectations",
        description:
          "Roles requis : PROFESSEUR, RH ou ADMIN. Un professeur ne voit que ses affectations.",
        parameters: [
          {
            name: "professeurId",
            in: "query",
            required: false,
            schema: { type: "string" },
          },
          {
            name: "sessionId",
            in: "query",
            required: false,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: successResponse("Liste des affectations"),
          ...errorResponses,
        },
      },
    },
    "/api/history": {
      get: {
        tags: ["Affectations"],
        summary: "Historique des affectations",
        description:
          "Roles requis : ADMIN, RH ou PROFESSEUR. ADMIN/RH voient toute la base; un professeur ne voit que ses affectations.",
        parameters: [
          {
            name: "sessionId",
            in: "query",
            required: false,
            schema: { type: "string" },
          },
          {
            name: "professorId",
            in: "query",
            required: false,
            schema: { type: "string" },
          },
          {
            name: "courseId",
            in: "query",
            required: false,
            schema: { type: "string" },
          },
          {
            name: "statut",
            in: "query",
            required: false,
            schema: { $ref: "#/components/schemas/AssignmentStatus" },
          },
        ],
        responses: {
          200: successResponse("Historique des affectations"),
          ...errorResponses,
        },
      },
    },
    "/api/affectations/analyze": {
      post: {
        tags: ["Affectations"],
        summary: "Lance l'analyse automatique des affectations",
        description: "Role requis : RH ou ADMIN. Appelle FastAPI et sauvegarde les propositions.",
        requestBody: jsonBody({
          type: "object",
          required: ["sessionId"],
          properties: {
            sessionId: { type: "string" },
            programId: { type: "string" },
          },
        }),
        responses: {
          200: successResponse("Propositions generees"),
          ...errorResponses,
          503: { description: "Service FastAPI indisponible" },
          504: { description: "Timeout FastAPI" },
        },
      },
    },
    "/api/affectations/{id}": {
      patch: {
        tags: ["Affectations"],
        summary: "Met a jour le statut d'une affectation",
        description: "Role requis : RH ou ADMIN. Cycle autorise : PROPOSEE -> AJUSTEE -> FINALISEE.",
        parameters: [idParam()],
        requestBody: jsonBody({
          type: "object",
          required: ["statut"],
          properties: {
            statut: { $ref: "#/components/schemas/AssignmentStatus" },
          },
        }),
        responses: {
          200: successResponse("Statut mis a jour"),
          ...errorResponses,
        },
      },
    },
    "/api/affectations/{id}/adjust": {
      patch: {
        tags: ["Affectations"],
        summary: "Ajuste manuellement le cours d'une affectation",
        description:
          "Role requis : RH ou ADMIN. Les affectations FINALISEE ne peuvent plus etre ajustees.",
        parameters: [idParam()],
        requestBody: jsonBody({
          type: "object",
          required: ["coursId"],
          properties: {
            coursId: { type: "string" },
            notes: { type: "string", maxLength: 200 },
          },
        }),
        responses: {
          200: successResponse("Affectation ajustee"),
          ...errorResponses,
        },
      },
    },
    "/api/affectations/finalize": {
      patch: {
        tags: ["Affectations"],
        summary: "Finalise toutes les affectations AJUSTEE d'une session",
        description: "Role requis : RH ou ADMIN. Seules les affectations AJUSTEE sont finalisees.",
        requestBody: jsonBody({
          type: "object",
          required: ["sessionId"],
          properties: {
            sessionId: { type: "string" },
          },
        }),
        responses: {
          200: successResponse("Affectations finalisees"),
          ...errorResponses,
        },
      },
    },
    "/api/extract-cv": {
      post: {
        tags: ["CV"],
        summary: "Transfere un CV a FastAPI pour extraction LLM",
        description: "Role requis : PROFESSEUR. Requete multipart/form-data avec le champ `file`.",
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                required: ["file"],
                properties: {
                  file: { type: "string", format: "binary" },
                },
              },
            },
          },
        },
        responses: {
          200: successResponse("Donnees CV extraites"),
          ...errorResponses,
          503: { description: "Service d'extraction indisponible" },
        },
      },
    },
    "/api/professor/cvs": {
      post: {
        tags: ["CV"],
        summary: "Sauvegarde/valide les donnees CV du professeur connecte",
        description: "Role requis : PROFESSEUR.",
        responses: {
          200: successResponse("CV sauvegarde"),
          ...errorResponses,
        },
      },
    },
    "/api/professor/me": {
      get: {
        tags: ["Users"],
        summary: "Retourne le professeur connecte",
        description: "Role requis : PROFESSEUR.",
        responses: {
          200: successResponse("Profil professeur"),
          ...errorResponses,
        },
      },
    },
    "/api/professor/snapshots": {
      get: {
        tags: ["CV"],
        summary: "Liste les snapshots CV du professeur connecte",
        description: "Role requis : PROFESSEUR.",
        responses: {
          200: successResponse("Snapshots CV"),
          ...errorResponses,
        },
      },
    },
    "/api/professor/snapshots/{id}/restore": {
      post: {
        tags: ["CV"],
        summary: "Restaure un snapshot CV",
        description: "Role requis : PROFESSEUR.",
        parameters: [idParam()],
        responses: {
          200: successResponse("Snapshot restaure"),
          ...errorResponses,
        },
      },
    },
    "/api/rh/professors": {
      get: {
        tags: ["RH"],
        summary: "Liste les professeurs pour le dashboard RH",
        description: "Role requis : RH ou ADMIN.",
        responses: {
          200: successResponse("Liste des professeurs"),
          ...errorResponses,
        },
      },
    },
  },
};
