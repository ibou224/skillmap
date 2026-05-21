import {NextResponse} from "next/server";
import prisma from "@/lib/prisma.js";
import {isValidString} from "@/lib/validation.js";

export async function GET(request) {
  try {
    const skills = await prisma.skill.findMany({
      orderBy: { nom: "asc" },
      select: { id: true, nom: true },
    });
    return NextResponse.json({ success: true, data: skills }, { status: 200 });
  } catch (error) {
    console.error("[GET_SKILLS_ERROR]:", error);
    return NextResponse.json(
      { success: false, error: "Erreur interne du serveur lors de la récupération des compétences." },
      { status: 500 }
    );
  }
}