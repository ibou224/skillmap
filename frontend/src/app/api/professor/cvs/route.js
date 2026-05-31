
/**
 * @module api/professor/cvs
 * @description Route de mise à jour du profil CV d'un professeur authentifié.
 *
 * Seuls les utilisateurs avec le rôle `PROFESSEUR` peuvent accéder à cette route.
 * La mise à jour est atomique : toutes les sections (profil, expériences, formations,
 * compétences) sont appliquées dans une seule transaction Prisma. En cas d'échec
 * partiel, l'intégralité de la transaction est annulée.
 *
 * Stratégie de mise à jour des collections (expériences, formations, compétences) :
 * delete-then-insert — les enregistrements existants sont supprimés avant la
 * réinsertion. Chaque section est optionnelle : si elle est absente du corps de
 * la requête, elle n'est pas modifiée.
 */

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma.js";
import { requireRole, getIp } from "@/lib/permission.js";
import { normalizeInfosProfessor } from "@/lib/formatData";

/**
 * Met à jour le profil CV du professeur connecté.
 *
 * Toutes les sections du corps sont optionnelles. Seules les sections présentes
 * dans le payload sont traitées ; les autres restent inchangées en base.
 *
 * @route   POST /api/professor/cvs
 * @access  PROFESSEUR
 *
 * @param {Request} request - Requête HTTP entrante.
 *
 * @param {Object}   [request.body.profile]                    - Informations de contact et présentation.
 * @param {string}   [request.body.profile.telephone]          - Numéro de téléphone.
 * @param {string}   [request.body.profile.ville]              - Ville de résidence.
 * @param {string}   [request.body.profile.siteWeb]            - URL du site personnel.
 * @param {string}   [request.body.profile.linkedin]           - URL du profil LinkedIn.
 * @param {string}   [request.body.profile.resume]             - Résumé / bio professionnelle.
 *
 * @param {Array<Object>} [request.body.experiences]           - Liste complète des expériences (remplace l'existant).
 * @param {string}   request.body.experiences[].poste          - Intitulé du poste.
 * @param {string}   [request.body.experiences[].domaine]      - Domaine d'activité.
 * @param {string}   request.body.experiences[].entreprise     - Nom de l'entreprise.
 * @param {string}   request.body.experiences[].debut          - Date de début au format `YYYY-MM`.
 * @param {string}   [request.body.experiences[].fin]          - Date de fin au format `YYYY-MM` (null = en cours).
 * @param {string}   [request.body.experiences[].description]  - Description du rôle.
 *
 * @param {Array<Object>} [request.body.formations]            - Liste complète des formations (remplace l'existant).
 * @param {string}   request.body.formations[].diplome         - Intitulé du diplôme.
 * @param {string}   [request.body.formations[].niveauDiplome] - Niveau (`DEC`, `BAC`, `MAITRISE`, `DOCTORAT`, `OTHER`). Défaut : `OTHER`.
 * @param {string}   request.body.formations[].etablissement   - Établissement d'obtention.
 * @param {number}   request.body.formations[].anneeObtention  - Année d'obtention (entier).
 *
 * @param {Array<Object>} [request.body.competences]           - Liste complète des compétences (remplace l'existant).
 * @param {string}   request.body.competences[].nom            - Nom de la compétence (clé d'unicité dans `Skill`).
 * @param {string}   [request.body.competences[].categorie]    - Catégorie. Défaut : `"autre"`.
 * @param {string}   [request.body.competences[].description]  - Description de la compétence.
 * @param {string}   [request.body.competences[].niveau]       - Niveau de maîtrise (`DEBUTANT`, `INTERMEDIAIRE`, `AVANCE`, `EXPERT`). Défaut : `DEBUTANT`.
 * @param {number}   [request.body.competences[].anneesExp]    - Années d'expérience avec cette compétence. Défaut : `0`.
 * @param {string}   [request.body.competences[].source]       - Origine de la compétence (`SAISIE_MANUELLE`, `EXTRACTION_CV`). Défaut : `SAISIE_MANUELLE`.
 *
 * @returns {Promise<NextResponse>} 200 + `{ success: true, data: ProfessorCV }` — profil mis à jour et normalisé.
 * @returns {Promise<NextResponse>} 401 — utilisateur non authentifié ou rôle insuffisant.
 * @returns {Promise<NextResponse>} 404 — aucun profil `Professor` lié à cet utilisateur.
 * @returns {Promise<NextResponse>} 500 — erreur serveur inattendue.
 */
export async function POST(request) {
  const { session, error } = await requireRole("PROFESSEUR");
  if (error) return error;

  try {
    const { experiences, formations, competences, profile, snapshotLabel } =
      await request.json();
    const professor = await prisma.professor.findUnique({
      where: { userId: session.user.id },
      include: {
        skills: { include: { skill: true } },
        experiences: true,
        formations: true,
        user: { select: { nom: true, prenom: true, email: true } },
      },
    });

    if (!professor) {
      return NextResponse.json(
        { success: false, message: "Profil professeur introuvable." },
        { status: 404 },
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const lastSnapshot = await tx.cvSnapshot.findFirst({
        where: { professorId: professor.id },
        orderBy: { version: "desc" },
        select: { version: true },
      });
      await tx.cvSnapshot.create({
        data: {
          professorId: professor.id,
          version: (lastSnapshot?.version ?? 0) + 1,
          label: snapshotLabel ?? "Modification manuelle",
          data: {
            titre: professor.titre,
            telephone: professor.telephone,
            ville: professor.ville,
            siteWeb: professor.siteWeb,
            linkedin: professor.linkedIn,
            github: professor.github,
            resume: professor.resume,
            email: professor.email,
            langues: professor.langues,
            competences: professor.skills.map((s) => ({
              nom: s.skill.nom,
              niveau: s.niveau,
            })),
            experiences: professor.experiences.map((e) => ({
              poste: e.poste,
              entreprise: e.entreprise,
              debut: e.dateDebut
                ? new Date(e.dateDebut).toISOString().slice(0, 7)
                : "",
              fin: e.dateFin
                ? new Date(e.dateFin).toISOString().slice(0, 7)
                : "",
              description: e.description ?? "",
            })),
            formations: professor.formations.map((f) => ({
              diplome: f.diplome,
              niveauDiplome: f.niveauDiplome,
              etablissement: f.etablissement,
              anneeObtention: String(f.anneeObtention),
            })),
          },
        },
      });
      if (profile) {
        await tx.professor.update({
          where: { id: professor.id },
          data: {
            titre: profile.titre,
            email: profile.email,
            telephone: profile.telephone,
            ville: profile.ville,
            siteWeb: profile.siteWeb,
            linkedIn: profile.linkedin,
            github: profile.github,
            resume: profile.resume,
            ...(profile.langues !== undefined && { langues: profile.langues }),
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
              entreprise: exp.entreprise,
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

      const { count: validatedCount } = await tx.cvExtraction.updateMany({
        where: { professorId: professor.id, status: "EXTRACTED" },
        data:  { status: "VALIDATED", validatedAt: new Date() },
      });

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
          cvExtractions: {
            orderBy: { createdAt: "desc" },
            take: 1,
            select: { status: true },
          },
        },
      });
      await tx.auditLog.create({
        data: {
          action: lastSnapshot ? "UPDATE" : "CREATE",
          entityType: "CV",
          entityId: professor.id,
          metadata: {
            email: session.user.email,
            role: session.user.role,
            message: lastSnapshot ? "nouveau CV soumis" : "Premier CV soumis",
          },
          ipAddress: getIp(request),
          userId: session.user.id,
        },
      });

      if (validatedCount > 0) {
        await tx.auditLog.create({
          data: {
            action: "VALIDATE",
            entityType: "CV",
            entityId: professor.id,
            metadata: {
              email: session.user.email,
              role: session.user.role,
              message: "Mise a jour du CV après validation",
            },
            ipAddress: getIp(request),
            userId: session.user.id,
          },
        });
      }

      return updatedProfessor;
    });

    return NextResponse.json({
      success: true,
      data: normalizeInfosProfessor(result),
    });
  } catch (err) {
    console.error("Erreur /api/professor/cvs :", err);
    return NextResponse.json(
      { success: false, message: err?.message ?? "Erreur serveur." },
      { status: 500 },
    );
  }
}