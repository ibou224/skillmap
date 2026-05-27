import { NextResponse } from "next/server";
import prisma from "@/lib/prisma.js";
import { requireRole, getIp } from "@/lib/permission";

/**
 * @module api/sessions
 * @description Route de gestion des sessions scolaires
 * Récupère la liste des sessions avec compteurs de groupes et affectations,
 * avec support de la recherche et pagination.
 */

/**
 * GET /api/sessions
 * @route GET /api/sessions
 * @description Récupère la liste de toutes les sessions avec le compteur de groupes et d'affectations.
 * Tri chronologique par date de début (ascendant).
 * Supporte la recherche par nom et la pagination.
 * 
 * @queryParam {string} [search] - Recherche par nom de session (case-insensitive)
 * @queryParam {number} [page=1] - Numéro de page pour la pagination (min: 1)
 * @queryParam {number} [limit=10] - Nombre de sessions par page (min: 1, max: 500)
 *
 * @param {Request} request - Objet requête Next.js
 *
 * @returns {Promise<NextResponse>} 200 + { success: true, data: Session[], pagination: {...} }
 * @returns {Promise<NextResponse>} 500 + { success: false, message } en cas d'erreur
 * 
 * @example
 * // Récupérer page 1 des sessions, 20 par page
 * const res = await fetch('/api/sessions?page=1&limit=20');
 * const { data: sessions, pagination } = await res.json();
 * 
 * @example
 * // Rechercher une session par nom
 * const res = await fetch('/api/sessions?search=2024');
 * const { data: sessions } = await res.json();
 */
export async function GET(request) {
  const { error } = await requireRole("ADMIN", "RH");
  if (error) return error;

  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const page = Math.max(1, Number(searchParams.get("page") || 1));
    const limit = Math.min(
      500,
      Math.max(1, Number(searchParams.get("limit") || 10)),
    );
    const skip = (page - 1) * limit;

    const where = {};
    if (search) {
      where.nom = { contains: search, mode: "insensitive" };
    }

    const [sessions, total] = await Promise.all([
      prisma.session.findMany({
        where,
        orderBy: [{ dateDebut: "desc" }, { createdAt: "desc" }],
        include: {
          _count: { select: { assignments: true } },
        },
        skip,
        take: limit,
      }),
      prisma.session.count({ where }),
    ]);

    const mapped = sessions.map((s) => ({
      ...s,
      _count: { affectations: s._count.assignments, groupes: 0 },
    }));

    return NextResponse.json(
      {
        success: true,
        data: mapped,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Erreur GET /api/sessions:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Erreur lors de la récupération des sessions.",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    );
  }
}

/**
 * Crée une nouvelle session académique.
 *
 * Le nom est obligatoire et doit être unique.
 * Les dates sont stockées en UTC pour éviter les décalages de fuseau horaire.
 * Si une date de fin est fournie, elle doit être postérieure à la date de début.
 *
 * @route POST /api/sessions
 * @param {Request} request - La requête HTTP entrante.
 * @param {string} request.body.nom - Nom de la session (obligatoire, doit être unique).
 * @param {string} [request.body.dateDebut] - Date de début au format ISO (ex: "2024-09-01").
 * @param {string} [request.body.dateFin] - Date de fin au format ISO (ex: "2025-06-30").
 * @returns {NextResponse} 201 - Session créée avec succès.
 * @returns {NextResponse} 400 - Nom manquant ou dates incohérentes.
 * @returns {NextResponse} 409 - Une session avec ce nom existe déjà.
 * @returns {NextResponse} 500 - Erreur interne du serveur.
 */
export async function POST(request) {
  const { session: authSession, error } = await requireRole("ADMIN", "RH");
  if (error) return error;

  try {
    const body = await request.json();
    const { nom, dateDebut, dateFin, saison, annee } = body;

    // Validation : nom obligatoire
    if (!nom || typeof nom !== "string" || nom.trim() === "") {
      return NextResponse.json(
        { success: false, message: "Le nom de la session est obligatoire." },
        { status: 400 },
      );
    }

    // Validation : période (enum)
    const PERIODES_VALIDES = ["AUTOMNE", "HIVER", "ETE", "PRINTEMPS"];
    if (saison && !PERIODES_VALIDES.includes(saison.toUpperCase())) {
      return NextResponse.json(
        { success: false, message: `Période invalide. Valeurs acceptées : ${PERIODES_VALIDES.join(", ")}.` },
        { status: 400 },
      );
    }

    // Vérification d'unicité du nom
    const existing = await prisma.session.findUnique({ where: { nom: nom.trim() } });

    if (existing) {
      return NextResponse.json(
        { success: false, message: `La session "${nom.trim()}" existe déjà.` },
        { status: 409 },
      );
    }

    // --- SÉCURISATION DES DATES (Mode UTC strict) ---
    const parseDateUTC = (dateStr) => {
      if (!dateStr) return null;
      const datePart = dateStr.split("T")[0];
      const [year, month, day] = datePart.split("-");
      return new Date(
        Date.UTC(
          parseInt(year, 10),
          parseInt(month, 10) - 1,
          parseInt(day, 10),
        ),
      );
    };

    const debutUTC = parseDateUTC(dateDebut);
    const finUTC = parseDateUTC(dateFin);

    if (debutUTC && finUTC && finUTC < debutUTC) {
      return NextResponse.json(
        {
          success: false,
          message: "La date de fin doit être après la date de début.",
        },
        { status: 400 },
      );
    }

    // Création de la session
    const session = await prisma.session.create({
      data: {
        nom: nom.trim(),
        periode: saison ? saison.toUpperCase() : null,
        annee: annee ? parseInt(annee, 10) : null,
        dateDebut: debutUTC,
        dateFin: finUTC,
      },
      include: {
        _count: { select: { assignments: true } },
      },
    });

    await prisma.weightsConfig.create({
      data: {
        sessionId: session.id,
        competencesPct: 40,
        experiencePct: 25,
        formationPct: 20,
        historiquePct: 15,
      },
    });

    await prisma.auditLog.create({
      data: {
        action: "CREATE",
        entityType: "SESSION",
        entityId: session.id,
        userId: authSession.user.id,
        metadata: {
          email: authSession.user.email,
          role: authSession.user.role,
          message: "Session créée",
          nom: session.nom,
        },
        ipAddress: getIp(request),
      },
    });

    const sessionMapped = {
      ...session,
      _count: { affectations: session._count.assignments, groupes: 0 },
    };

    return NextResponse.json(
      {
        success: true,
        data: sessionMapped,
        message: `Session "${session.nom}" créée avec succès.`,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Erreur POST /api/sessions:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Erreur lors de la création de la session.",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    );
  }
}
