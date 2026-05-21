-- AlterTable
ALTER TABLE "Program" ADD COLUMN     "departementId" TEXT;

-- CreateTable
CREATE TABLE "Departement" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Departement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Departement_code_key" ON "Departement"("code");

-- AddForeignKey
ALTER TABLE "Program" ADD CONSTRAINT "Program_departementId_fkey" FOREIGN KEY ("departementId") REFERENCES "Departement"("id") ON DELETE SET NULL ON UPDATE CASCADE;
