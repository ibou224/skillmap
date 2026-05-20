import { NextResponse } from 'next/server';
import prisma from "@/lib/prisma.js";
import { requireRole } from "@/lib/permission.js";

export async function GET(request) {
  const { session, error } = await requireRole("PROFESSEUR");
  if (error) return error;

  try {
    const professor = await prisma.professor.findUnique({
      where: { userId: session.user.id },
      include: {
        user: true,
        skills: {
          include: {
            skill: true,
          },
        },
        experiences: true,
        formations: true,
        cvExtractions: true,
      },
    });

    if (!professor) {
      return NextResponse.json(
        { success: false, message: "Profil professeur introuvable." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: professor,
    });

  } catch (err) {
    console.error("Erreur :", err);
    return NextResponse.json(
      { success: false, message: "Erreur serveur." },
      { status: 500 }
    );
  }
}