/*
  Warnings:

  - Added the required column `description` to the `CreditsTranscition` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CreditsTranscition" DROP COLUMN "description",
ADD COLUMN     "description" JSONB NOT NULL;
