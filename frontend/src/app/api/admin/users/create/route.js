import { NextResponse } from "next/server";
import prisma from "@/lib/prisma.js";
import bcrypt from "bcryptjs";
import { isValidEmail, isValidPassword, isValidString, isValidRole } from "@/lib/validation.js";
import { requireRole, getIp } from "@/lib/permission.js";
import { checkRateLimit, rateLimitResponse } from "@/lib/rateLimit.js";

/**
 * @module app/api/admin/users/create/route
 * @description Route API de création d'utilisateur (administration), avec
 * validation des champs, rate limiting, gestion des doublons d'email et création
 * automatique du profil Professeur si le rôle est PROFESSEUR.
 */

/**
 * Crée un nouvel utilisateur dans le système.
 *
 * @route POST /api/admin/users/create
 * @access ADMIN
 */
export async function POST(request) {
  const { session, error } = await requireRole("ADMIN");
  if (error) return error;

  // Rate limiting : max 10 créations par minute par administrateur
  const rl = checkRateLimit(`${session.user.id}:admin-create`, 10, 60_000);
  if (!rl.allowed) return rateLimitResponse(rl.retryAfterSec);

  try {
    const { email, password, nom, prenom, role, isActive } = await request.json();

    if (!email || !password || !nom || !prenom || !role || isActive === undefined) {
      return NextResponse.json(
        { success: false, message: "Tous les champs obligatoires doivent etre renseignes." },
        { status: 400 }
      );
    }

    const nomValidation = isValidString(nom);
    if (!nomValidation.valid) {
      return NextResponse.json(
        { success: false, message: "Le nom contient des caracteres invalides." },
        { status: 400 }
      );
    }

    const prenomValidation = isValidString(prenom);
    if (!prenomValidation.valid) {
      return NextResponse.json(
        { success: false, message: "Le prenom contient des caracteres invalides." },
        { status: 400 }
      );
    }

    const emailValidation = isValidEmail(email);
    if (!emailValidation.valid) {
      return NextResponse.json(
        { success: false, message: "Le format de l'adresse email est invalide." },
        { status: 400 }
      );
    }

    if (!isValidRole(role)) {
      return NextResponse.json(
        { success: false, message: "Role invalide. Les roles autorises sont : ADMIN, RH, PROFESSEUR." },
        { status: 400 }
      );
    }

    const passwordValidation = isValidPassword(password.trim());
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { success: false, message: passwordValidation.message },
        { status: 400 }
      );
    }

    const normalizedRole = role.toUpperCase().trim();

    // Résoudre les doublons de nom : jean.dupont → jean.dupont2 → jean.dupont3 …
    const baseEmail = email.toLowerCase().trim();
    const [localPart, domain] = baseEmail.split("@");
    let normalizedEmail = baseEmail;
    let suffix = 2;
    while (await prisma.user.findUnique({ where: { email: normalizedEmail } })) {
      normalizedEmail = `${localPart}${suffix}@${domain}`;
      suffix++;
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        email: normalizedEmail,
        nom: nom.trim(),
        prenom: prenom.trim(),
        passwordHash,
        role: normalizedRole,
        isActive: isActive,
        loginAttempts: 0,
      },
    });

    if (normalizedRole === "PROFESSEUR") {
      await prisma.professor.create({ data: { userId: newUser.id, langues: [] } });
    }

    const { passwordHash: _, ...userWithoutPassword } = newUser;

    await prisma.auditLog.create({
      data: {
        action: "CREATE",
        entityType: "USER",
        entityId: newUser.id,
        userId: session.user.id,
        metadata: {
          email: session.user.email,
          role: session.user.role,
          message: "Nouvel utilisateur créé",
          cible: normalizedEmail,
          roleAssigne: normalizedRole,
        },
        ipAddress: getIp(request),
      },
    });

    return NextResponse.json(
      { success: true, message: "Utilisateur cree avec succes.", user: userWithoutPassword },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erreur lors de la creation de l'utilisateur :", error);

    if (error.code === "P2002") {
      return NextResponse.json(
        { success: false, message: "Cet email est deja utilise par un autre compte." },
        { status: 409 }
      );
    }

    if (error.code === "P2003") {
      return NextResponse.json(
        { success: false, message: "Une reference fournie est introuvable." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Une erreur interne est survenue lors de la creation de l'utilisateur." },
      { status: 500 }
    );
  }
}
