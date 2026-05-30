import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireRole, getIp } from "@/lib/permission";

/**
 * Restaure une version précédente du CV.
 * Sauvegarde l'état actuel avant restauration, puis réapplique les données du snapshot choisi.
 *
 * @route POST /api/professor/snapshots/[id]/restore
 * @access PROFESSEUR
 */
export async function POST(request, { params }) {
  const { session, error } = await requireRole("PROFESSEUR");
  if (error) return error;

  const { id } = await params;

  try {
    const professor = await prisma.professor.findUnique({
      where:   { userId: session.user.id },
      include: {
        skills:      { include: { skill: true } },
        experiences: true,
        formations:  true,
      },
    });
    if (!professor) {
      return NextResponse.json(
        { success: false, message: "Profil introuvable." },
        { status: 404 }
      );
    }

    const snapshot = await prisma.cvSnapshot.findUnique({ where: { id } });
    if (!snapshot || snapshot.professorId !== professor.id) {
      return NextResponse.json(
        { success: false, message: "Version introuvable." },
        { status: 404 }
      );
    }

    const cv = snapshot.data;

    await prisma.$transaction(async (tx) => {
      const last = await tx.cvSnapshot.findFirst({
        where:   { professorId: professor.id },
        orderBy: { version: "desc" },
        select:  { version: true },
      });
      await tx.cvSnapshot.create({
        data: {
          professorId: professor.id,
          version:     (last?.version ?? 0) + 1,
          label:       `Avant restauration vers version ${snapshot.version}`,
          data: {
            telephone:   professor.telephone,
            ville:       professor.ville,
            siteWeb:     professor.siteWeb,
            linkedin:    professor.linkedIn,
            resume:      professor.resume,
            langues:     professor.langues,
            competences: professor.skills.map((s) => ({ nom: s.skill.nom, niveau: s.niveau })),
            experiences: professor.experiences.map((e) => ({
              poste:       e.poste,
              entreprise:  e.entreprise,
              debut:       e.dateDebut ? new Date(e.dateDebut).toISOString().slice(0, 7) : "",
              fin:         e.dateFin   ? new Date(e.dateFin).toISOString().slice(0, 7)   : "",
              description: e.description ?? "",
            })),
            formations: professor.formations.map((f) => ({
              diplome:        f.diplome,
              niveauDiplome:  f.niveauDiplome,
              etablissement:  f.etablissement,
              anneeObtention: String(f.anneeObtention),
            })),
          },
        },
      });

      await tx.professor.update({
        where: { id: professor.id },
        data: {
          titre:     cv.titre     ?? null,
          telephone: cv.telephone ?? null,
          ville:     cv.ville     ?? null,
          siteWeb:   cv.siteWeb   ?? null,
          linkedIn:  cv.linkedin  ?? null,
          resume:    cv.resume    ?? null,
          langues:   cv.langues   ?? [],
        },
      });

      await tx.experience.deleteMany({ where: { professorId: professor.id } });
      if (cv.experiences?.length > 0) {
        await tx.experience.createMany({
          data: cv.experiences.map((e) => ({
            professorId: professor.id,
            poste:       e.poste,
            domaine:     "",
            entreprise:  e.entreprise,
            dateDebut:   new Date(e.debut + "-01"),
            dateFin:     e.fin ? new Date(e.fin + "-01") : null,
            description: e.description ?? "",
          })),
        });
      }

      await tx.formation.deleteMany({ where: { professorId: professor.id } });
      if (cv.formations?.length > 0) {
        await tx.formation.createMany({
          data: cv.formations.map((f) => ({
            professorId:    professor.id,
            diplome:        f.diplome,
            niveauDiplome:  f.niveauDiplome ?? "OTHER",
            etablissement:  f.etablissement,
            anneeObtention: parseInt(f.anneeObtention) || new Date().getFullYear(),
          })),
        });
      }

      await tx.professorSkill.deleteMany({ where: { professorId: professor.id } });
      for (const comp of (cv.competences ?? [])) {
        let skill = await tx.skill.findUnique({ where: { nom: comp.nom } });
        if (!skill) {
          skill = await tx.skill.create({
            data: { nom: comp.nom, categorie: "autre", description: "" },
          });
        }
        await tx.professorSkill.create({
          data: {
            professorId: professor.id,
            skillId:     skill.id,
            niveau:      comp.niveau ?? "DEBUTANT",
            anneesExp:   0,
            source:      "SAISIE_MANUELLE",
          },
        });
      }

      await tx.auditLog.create({
        data: {
          action: "UPDATE",
          entityType: "CV",
          entityId: professor.id,
          userId: session.user.id,
          metadata: {
            email: session.user.email,
            role: session.user.role,
            message: `CV restauré à la version ${snapshot.version} — "${snapshot.label}"`,
          },
          ipAddress: getIp(request),
        },
      });
    });

    return NextResponse.json({
      success: true,
      message: `Retour à la version ${snapshot.version} — "${snapshot.label}" effectué.`,
    });
  } catch (err) {
    console.error("POST /api/professor/snapshots/[id]/restore :", err);
    return NextResponse.json(
      { success: false, message: err.message ?? "Erreur serveur." },
      { status: 500 }
    );
  }
}
