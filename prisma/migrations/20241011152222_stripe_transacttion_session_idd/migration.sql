/*
  Warnings:

  - A unique constraint covering the columns `[sessionId]` on the table `Transaction` will be added. If there are existing duplicate values, this will fail.
  - Made the column `sessionId` on table `Transaction` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Transaction" ALTER COLUMN "sessionId" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_sessionId_key" ON "Transaction"("sessionId");
