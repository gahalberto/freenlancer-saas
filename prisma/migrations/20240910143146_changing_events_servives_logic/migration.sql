-- AlterTable
ALTER TABLE "EventsServices" ADD COLUMN     "accepted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "responseDate" TIMESTAMP(3);
