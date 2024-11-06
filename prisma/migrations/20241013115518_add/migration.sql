/*
  Warnings:

  - You are about to drop the column `userId` on the `EventsServices` table. All the data in the column will be lost.
  - You are about to drop the `MashguiachServices` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "EventsServices" DROP CONSTRAINT "EventsServices_userId_fkey";

-- DropForeignKey
ALTER TABLE "MashguiachServices" DROP CONSTRAINT "MashguiachServices_MashguiachId_fkey";

-- DropForeignKey
ALTER TABLE "MashguiachServices" DROP CONSTRAINT "MashguiachServices_ServiceId_fkey";

-- AlterTable
ALTER TABLE "EventsServices" DROP COLUMN "userId";

-- DropTable
DROP TABLE "MashguiachServices";

-- AddForeignKey
ALTER TABLE "EventsServices" ADD CONSTRAINT "EventsServices_mashguiachId_fkey" FOREIGN KEY ("mashguiachId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
