-- Move identity fields from Professor to User.
ALTER TABLE "User" ADD COLUMN "nom" TEXT;
ALTER TABLE "User" ADD COLUMN "prenom" TEXT;

UPDATE "User" AS u
SET
  "nom" = p."nom",
  "prenom" = p."prenom"
FROM "Professor" AS p
WHERE p."userId" = u."id";

UPDATE "User"
SET
  "nom" = COALESCE("nom", ''),
  "prenom" = COALESCE("prenom", '');

ALTER TABLE "User" ALTER COLUMN "nom" SET NOT NULL;
ALTER TABLE "User" ALTER COLUMN "prenom" SET NOT NULL;

ALTER TABLE "Professor" DROP COLUMN "nom";
ALTER TABLE "Professor" DROP COLUMN "prenom";
