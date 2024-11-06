/*
  Warnings:

  - The values [Peding] on the enum `TransactionStatus` will be removed. If these variants are still used in the database, this will fail.
  - Added the required column `createdAt` to the `CreditsTranscition` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updateAt` to the `CreditsTranscition` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "TransactionStatus_new" AS ENUM ('Success', 'Failed', 'Pending');
ALTER TABLE "Transaction" ALTER COLUMN "status" TYPE "TransactionStatus_new" USING ("status"::text::"TransactionStatus_new");
ALTER TABLE "CreditsTranscition" ALTER COLUMN "status" TYPE "TransactionStatus_new" USING ("status"::text::"TransactionStatus_new");
ALTER TYPE "TransactionStatus" RENAME TO "TransactionStatus_old";
ALTER TYPE "TransactionStatus_new" RENAME TO "TransactionStatus";
DROP TYPE "TransactionStatus_old";
COMMIT;

-- AlterTable
ALTER TABLE "CreditsTranscition" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "serviceId" TEXT,
ADD COLUMN     "updateAt" TIMESTAMP(3) NOT NULL;
