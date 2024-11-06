-- AlterEnum
ALTER TYPE "TransactionStatus" ADD VALUE 'Peding';

-- CreateTable
CREATE TABLE "CreditsTranscition" (
    "id" SERIAL NOT NULL,
    "user1" TEXT NOT NULL,
    "user2" TEXT NOT NULL,
    "amount" TEXT NOT NULL,
    "description" TEXT,
    "status" "TransactionStatus" NOT NULL,

    CONSTRAINT "CreditsTranscition_pkey" PRIMARY KEY ("id")
);
