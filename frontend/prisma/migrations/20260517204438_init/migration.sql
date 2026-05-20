-- Rename NiveauDiplome enum values (French → English)
ALTER TYPE "NiveauDiplome" RENAME VALUE 'DOCTORAT' TO 'DOCTORATE';
ALTER TYPE "NiveauDiplome" RENAME VALUE 'MAITRISE' TO 'MASTERS';
ALTER TYPE "NiveauDiplome" RENAME VALUE 'BACCALAUREAT' TO 'BACHELORS';
ALTER TYPE "NiveauDiplome" RENAME VALUE 'DEC_TECHNIQUE' TO 'DEC';
ALTER TYPE "NiveauDiplome" RENAME VALUE 'AUTRE' TO 'OTHER';

-- Remove old FK constraint Course → Program
ALTER TABLE "Course" DROP CONSTRAINT "Course_programId_fkey";

-- Create implicit many-to-many junction table Course ↔ Program
CREATE TABLE "_CourseToProgram" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_CourseToProgram_AB_pkey" PRIMARY KEY ("A","B")
);

CREATE INDEX "_CourseToProgram_B_index" ON "_CourseToProgram"("B");

ALTER TABLE "_CourseToProgram" ADD CONSTRAINT "_CourseToProgram_A_fkey" FOREIGN KEY ("A") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "_CourseToProgram" ADD CONSTRAINT "_CourseToProgram_B_fkey" FOREIGN KEY ("B") REFERENCES "Program"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Add Entreprise column to Experience (DEFAULT '' pour les lignes existantes, puis supprimé)
ALTER TABLE "Experience" ADD COLUMN "Entreprise" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Experience" ALTER COLUMN "Entreprise" DROP DEFAULT;

-- Make Session.annee and Session.periode nullable
ALTER TABLE "Session" ALTER COLUMN "annee" DROP NOT NULL;
ALTER TABLE "Session" ALTER COLUMN "periode" DROP NOT NULL;

-- Add Session date columns
ALTER TABLE "Session" ADD COLUMN "dateDebut" TIMESTAMP(3);
ALTER TABLE "Session" ADD COLUMN "dateFin" TIMESTAMP(3);

-- Add unique index on Session.nom
CREATE UNIQUE INDEX "Session_nom_key" ON "Session"("nom");

-- Add professor profile fields
ALTER TABLE "Professor" ADD COLUMN "ville" TEXT;
ALTER TABLE "Professor" ADD COLUMN "siteWeb" TEXT;
ALTER TABLE "Professor" ADD COLUMN "linkedIn" TEXT;
ALTER TABLE "Professor" ADD COLUMN "resume" TEXT;
