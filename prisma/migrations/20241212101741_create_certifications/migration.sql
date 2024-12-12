-- CreateEnum
CREATE TYPE "HashgachotTypeEnum" AS ENUM ('CHALAVI', 'BASSARI', 'PARVE');

-- AlterTable
ALTER TABLE "Stores" ADD COLUMN     "comercialPhone" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "phone" TEXT NOT NULL DEFAULT '';

-- CreateTable
CREATE TABLE "Certifications" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "observation" TEXT,
    "kasherLePessach" BOOLEAN NOT NULL DEFAULT false,
    "HashgachotType" "HashgachotTypeEnum" NOT NULL,
    "issueDate" TIMESTAMP(3) NOT NULL,
    "validationDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Certifications_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Certifications" ADD CONSTRAINT "Certifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Certifications" ADD CONSTRAINT "Certifications_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Stores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
