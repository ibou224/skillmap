import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireRole } from "@/lib/permission";

/**
 * Liste toutes les versions enregistrées du CV du professeur connecté.
 *
 * @route GET /api/professor/snapshots
 * @access PROFESSEUR
 *
 * @returns {200} { success: true, data: CvSnapshot[] }
 */
export async function GET() {
  const { session, error } = await requireRole("PROFESSEUR");
  if (error) return error;

  try {
    const professor = await prisma.professor.findUnique({
      where:  { userId: session.user.id },
      select: { id: true },
    });
    if (!professor) {
      return NextResponse.json(
        { success: false, message: "Profil introuvable." },
        { status: 404 }
      );
    }

    const snapshots = await prisma.cvSnapshot.findMany({
      where:   { professorId: professor.id },
      orderBy: { version: "desc" },
      select:  { id: true, version: true, label: true, createdAt: true },
    });

    return NextResponse.json({ success: true, data: snapshots });
  } catch (err) {
    console.error("GET /api/professor/snapshots :", err);
    return NextResponse.json(
      { success: false, message: "Erreur serveur." },
      { status: 500 }
    );
  }
}