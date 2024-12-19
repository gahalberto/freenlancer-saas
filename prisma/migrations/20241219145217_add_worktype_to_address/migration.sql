/*
  Warnings:

  - You are about to drop the column `storeEvent` on the `EventsAdresses` table. All the data in the column will be lost.
  - Added the required column `storeEventId` to the `EventsAdresses` table without a default value. This is not possible if the table is not empty.
  - Added the required column `workType` to the `EventsAdresses` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "EventsAdresses" DROP CONSTRAINT "EventsAdresses_storeEvent_fkey";

-- AlterTable
ALTER TABLE "EventsAdresses" DROP COLUMN "storeEvent",
ADD COLUMN     "storeEventId" TEXT NOT NULL,
ADD COLUMN     "workType" "WORKTYPE" NOT NULL;

-- AddForeignKey
ALTER TABLE "EventsAdresses" ADD CONSTRAINT "EventsAdresses_storeEventId_fkey" FOREIGN KEY ("storeEventId") REFERENCES "StoreEvents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
