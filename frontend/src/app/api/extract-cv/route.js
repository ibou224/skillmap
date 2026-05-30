/**
 * @module api/extract-cv
 * @description Proxy Next.js → FastAPI pour l'extraction de CV par LLM.
 *
 * Reçoit le fichier PDF/Word du navigateur, le transfère à FastAPI
 * avec les headers d'authentification interne, puis transforme la
 * réponse LLM (clés anglaises) en tableau `[{ label, value }]`
 * compatible avec `normalizeField` côté client.
 *
 * Le fichier original est sauvegardé par FastAPI dans
 * `uploads/{professor_id}/{timestamp}_{filename}` (volume Docker `cv_uploads`).
 */

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getIp } from "@/lib/permission";
import { checkRateLimit, rateLimitResponse } from "@/lib/rateLimit.js";
import { notifyByRole } from "@/lib/notify";

const FASTAPI_URL =
  process.env.FASTAPI_INTERNAL_URL ||
  process.env.BACKEND_URL ||
  "http://localhost:8000";

/**
 * Convertit la réponse structurée du LLM en tableau de
 * champs `{ label, value }` attendu par `normalizeField` côté client.
 *
 * @param {Object} cvData - Données brutes retournées par le LLM.
 * @returns {Array<{ label: string, value: string }>}
 */
function transformLLMResponse(cvData) {
  const experiences = (cvData.experiences ?? []).map((exp, i) => ({
    id: i + 1,
    poste: exp.position ?? "",
    entreprise: exp.organization ?? "",
    domaine: "",
    debut: exp.startDate ?? "",
    fin: exp.endDate ?? null,
    description: exp.description ?? "",
  }));

  const formations = (cvData.education ?? []).map((edu, i) => ({
    id: i + 1,
    diplome: edu.diploma ?? "",
    etablissement: edu.institution ?? "",
    anneeObtention: edu.year ?? "",
    niveauDiplome: edu.niveauDiplome ?? "OTHER",
  }));

  // Normalise les compétences : conserve nom, niveau, niveauSource, anneesExp
  const competences = (cvData.skills ?? []).map((s) => {
    if (typeof s === "string")
      return {
        nom: s,
        niveau: "DEBUTANT",
        niveauSource: "INFERRED",
        anneesExp: null,
      };
    return {
      nom: s.nom ?? "",
      niveau: s.niveau ?? "INTERMEDIAIRE",
      niveauSource: s.niveauSource ?? "INFERRED",
      anneesExp: s.anneesExp ?? null,
    };
  });

  return [
    { label: "prenom", value: cvData.firstName ?? "" },
    { label: "nom", value: cvData.lastName ?? "" },
    { label: "email", value: cvData.email ?? "" },
    { label: "telephone", value: cvData.phone ?? "" },
    { label: "ville", value: cvData.city ?? "" },
    { label: "linkedin", value: cvData.linkedin ?? "" },
    { label: "siteWeb", value: cvData.portfolio ?? "" },
    { label: "github", value: cvData.github ?? "" },
    { label: "resume", value: cvData.summary ?? "" },
    { label: "competences", value: JSON.stringify(competences) },
    { label: "langues", value: JSON.stringify(cvData.languages ?? []) },
    { label: "experiences", value: JSON.stringify(experiences) },
    { label: "formations", value: JSON.stringify(formations) },
    { label: "certifications", value: JSON.stringify(cvData.certifications ?? []) },
  ];
}

/**
 * Transfère le CV à FastAPI pour extraction LLM, puis retourne les données
 * normalisées au format `[{ label, value }]`.
 *
 * @route   POST /api/extract-cv
 * @access  PROFESSEUR
 *
 * @param {Request} request - Requête multipart/form-data avec le champ `file`.
 *
 * @returns {Promise<NextResponse>} 200 + `{ success: true, data: Array<{label,value}>, extractionId: string }`
 * @returns {Promise<NextResponse>} 401 — non authentifié.
 * @returns {Promise<NextResponse>} 404 — profil professeur introuvable.
 * @returns {Promise<NextResponse>} 400/422 — fichier invalide (FastAPI).
 * @returns {Promise<NextResponse>} 500 — erreur serveur ou LLM indisponible.
 */
export async function POST(request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json(
      { success: false, message: "Non authentifié." },
      { status: 401 },
    );
  }
  if (session.user.role !== "PROFESSEUR") {
    return NextResponse.json(
      { success: false, message: "Accès refusé." },
      { status: 403 },
    );
  }

  // Rate limiting : max 5 extractions par minute par utilisateur
  const rl = checkRateLimit(`${session.user.id}:extract-cv`, 5, 60_000);
  if (!rl.allowed) return rateLimitResponse(rl.retryAfterSec);

  const professor = await prisma.professor.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });

  if (!professor) {
    return NextResponse.json(
      { success: false, message: "Profil professeur introuvable." },
      { status: 404 },
    );
  }

  try {
    const formData = await request.formData();

    if (!formData.has("file")) {
      return NextResponse.json(
        { success: false, message: "Aucun fichier envoyé." },
        { status: 400 },
      );
    }

    const fastapiResponse = await fetch(`${FASTAPI_URL}/analyze-cv/`, {
      method: "POST",
      headers: {
        "x-internal-api-key": process.env.INTERNAL_API_KEY ?? "",
        "professor-id": professor.id,
        "user-id": session.user.id,
      },
      body: formData,
    });

    if (!fastapiResponse.ok) {
      const errorResult = await fastapiResponse.json().catch(() => ({}));
      return NextResponse.json(
        {
          success: false,
          message: errorResult.detail ?? "Erreur lors de l'extraction.",
        },
        { status: fastapiResponse.status },
      );
    }
    const result = await fastapiResponse.json().catch(() => ({}));

    await prisma.auditLog.create({
      data: {
        action: "ANALYZE",
        entityType: "CV",
        entityId: professor.id,
        metadata: {
          email: session.user.email,
          role: session.user.role,
          message: "Nouveau CV televerser",
        },
        ipAddress: getIp(request),
        userId: session.user.id,
      },
    });
    await notifyByRole({
      roles: ["ADMIN", "RH"],
      type:  "NOUVEAU_CV",
      title: `Nouveau CV soumis — ${session.user.prenom} ${session.user.nom}`,
      body:  session.user.email,
      link:  "/dashboard/rh/cvs",
    });

    return NextResponse.json({
      success: true,
      data: transformLLMResponse(result.cv_data ?? {}),
      extractionId: result.extraction_id ?? null,
    });
  } catch (err) {
    console.error("Erreur connexion FastAPI:", err);
    return NextResponse.json(
      { success: false, message: "Service d'extraction indisponible." },
      { status: 503 },
    );
  }
}
