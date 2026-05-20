import { NextResponse } from "next/server";
import prisma from "@/lib/prisma.js";
import { requireRole } from "@/lib/permission.js";
import { normalizeInfosProfessor } from "@/lib/formatData";

export async function GET(request) {
  const { session, error } = await requireRole("PROFESSEUR");
  if (error) return error;

  try {
    const professor = await prisma.professor.findUnique({
      where: { userId: session.user.id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            nom: true,
            prenom: true,
            role: true,
          },
        },
        skills: {
          include: {
            skill: true,
          },
        },
        experiences: true,
        formations: true,
      },
    });

    if (!professor) {
      return NextResponse.json(
        { success: false, message: "Profil professeur introuvable." },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: normalizeInfosProfessor(professor),
    });
  } catch (err) {
    console.error("Erreur :", err);
    return NextResponse.json(
      { success: false, message: "Erreur serveur." },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  const { session, error } = await requireRole("PROFESSEUR");
  if (error) return error;

  try {
    const { experiences, formations, competences, profile } =
      await request.json();
    const professor = await prisma.professor.findUnique({
      where: { userId: session.user.id },
      select: {
        id: true,
      },
    });

    if (!professor) {
      return NextResponse.json(
        { success: false, message: "Profil professeur introuvable." },
        { status: 404 },
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      if (profile) {
        await tx.professor.update({
          where: { id: professor.id },
          data: {
            telephone: profile.telephone,
            ville: profile.ville,
            siteWeb: profile.siteWeb,
            linkedIn: profile.linkedin,
            resume: profile.resume,
          },
        });
      }

      if (experiences) {
        await tx.experience.deleteMany({
          where: { professorId: professor.id },
        });

        if (experiences.length > 0) {
          await tx.experience.createMany({
            data: experiences.map((exp) => ({
              professorId: professor.id,
              poste: exp.poste,
              domaine: exp.domaine || "",
              Entreprise: exp.entreprise,
              dateDebut: new Date(exp.debut + "-01"),
              dateFin: exp.fin ? new Date(exp.fin + "-01") : null,
              description: exp.description,
            })),
          });
        }
      }

      if (formations) {
        await tx.formation.deleteMany({
          where: { professorId: professor.id },
        });

        if (formations.length > 0) {
          await tx.formation.createMany({
            data: formations.map((form) => ({
              professorId: professor.id,
              diplome: form.diplome,
              niveauDiplome: form.niveauDiplome || "OTHER",
              etablissement: form.etablissement,
              anneeObtention: parseInt(form.anneeObtention),
            })),
          });
        }
      }

      if (competences) {
        await tx.professorSkill.deleteMany({
          where: { professorId: professor.id },
        });

        if (competences.length > 0) {
          for (const comp of competences) {
            let skill = await tx.skill.findUnique({
              where: { nom: comp.nom },
            });

            if (!skill) {
              skill = await tx.skill.create({
                data: {
                  nom: comp.nom,
                  categorie: comp.categorie || "autre",
                  description: comp.description || "",
                },
              });
            }

            await tx.professorSkill.create({
              data: {
                professorId: professor.id,
                skillId: skill.id,
                niveau: comp.niveau || "DEBUTANT",
                anneesExp: comp.anneesExp || 0,
                source: comp.source || "SAISIE_MANUELLE",
              },
            });
          }
        }
      }

      const updatedProfessor = await tx.professor.findUnique({
        where: { id: professor.id },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              nom: true,
              prenom: true,
              role: true,
            },
          },
          skills: {
            include: { skill: true },
          },
          experiences: {
            orderBy: { dateDebut: "desc" },
          },
          formations: {
            orderBy: { anneeObtention: "desc" },
          },
        },
      });
      return updatedProfessor;
    });

    return NextResponse.json({
      success: true,
      data: normalizeInfosProfessor(result),
    });
  } catch (err) {
    console.error("Erreur :", err);
    return NextResponse.json(
      { success: false, message: "Erreur serveur." },
      { status: 500 },
    );
  }
}
