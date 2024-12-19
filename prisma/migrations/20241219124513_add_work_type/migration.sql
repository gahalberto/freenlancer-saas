-- CreateEnum
CREATE TYPE "WORKTYPE" AS ENUM ('PRODUCAO', 'EVENTO');

-- AlterTable
ALTER TABLE "EventsServices" ADD COLUMN     "workType" "WORKTYPE";
