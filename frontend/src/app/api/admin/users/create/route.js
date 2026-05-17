/**
 * @module api/admin/users/create
 * @description Route API de creation d'un utilisateur par un administrateur.
 */

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma.js";
import bcrypt from "bcryptjs";
import { isValidEmail, isValidPassword, isValidString,isValidRole } from "@/lib/validation.js";
import { requireRole } from "@/lib/permission.js";

/**
 * Gere la route POST /api/admin/users/create.
 *
 * @param {Request} request - La requete HTTP entrante.
 * @returns {Promise<NextResponse>} Reponse JSON avec l'utilisateur cree ou un message d'erreur.
 */
export async function POST(request) {
    const {error} = await requireRole("ADMIN")
    if(error) return error;
  
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

    const normalizedEmail = email.toLowerCase().trim();
    const normalizedRole = role.toUpperCase().trim();

    const userUnique = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (userUnique) {
      return NextResponse.json(
        { success: false, message: "Un utilisateur avec cette adresse email existe deja." },
        { status: 409 }
      );
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

    const { passwordHash: _, ...userWithoutPassword } = newUser;

    return NextResponse.json(
      {
        success: true,
        message: "Utilisateur cree avec succes.",
        user: userWithoutPassword,
      },
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
