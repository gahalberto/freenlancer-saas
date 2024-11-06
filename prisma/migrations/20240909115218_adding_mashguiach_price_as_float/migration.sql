/*
  Warnings:

  - You are about to drop the column `MashguiachPrice` on the `EventsServices` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "EventsServices" DROP COLUMN "MashguiachPrice",
ADD COLUMN     "mashguiachPrice" DOUBLE PRECISION NOT NULL DEFAULT 0;
