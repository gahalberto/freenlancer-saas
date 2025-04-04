-- CreateEnum
CREATE TYPE "TYPE_ENTRIES" AS ENUM ('ENTRADA', 'SAIDA');

-- CreateEnum
CREATE TYPE "JustificationStatus" AS ENUM ('Pending', 'Approved', 'Rejected');

-- AlterEnum
ALTER TYPE "WORKTYPE" ADD VALUE 'SUBSTITUICAO';

-- AlterTable
ALTER TABLE "FixedJobs" ADD COLUMN     "monthly_salary" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "time_entries" ALTER COLUMN "entrace" SET DATA TYPE TIMESTAMP(6),
ALTER COLUMN "exit" SET DATA TYPE TIMESTAMP(6),
ALTER COLUMN "lunchEntrace" SET DATA TYPE TIMESTAMP(6),
ALTER COLUMN "lunchExit" SET DATA TYPE TIMESTAMP(6);

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "deleteAt" TIMESTAMP(6);

-- CreateTable
CREATE TABLE "Contact" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefone" TEXT,
    "assunto" TEXT,
    "mensagem" TEXT NOT NULL,
    "lido" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Contact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AbsenceJustification" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "store_id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "reason" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "attachmentUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AbsenceJustification_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "AbsenceJustification" ADD CONSTRAINT "AbsenceJustification_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AbsenceJustification" ADD CONSTRAINT "AbsenceJustification_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "Stores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
