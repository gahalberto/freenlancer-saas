/*
  Warnings:

  - You are about to drop the column `hoursQtd` on the `Events` table. All the data in the column will be lost.
  - You are about to drop the column `endEvent` on the `StoreEvents` table. All the data in the column will be lost.
  - You are about to drop the column `eventStartTime` on the `StoreEvents` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Events" DROP COLUMN "hoursQtd";

-- AlterTable
ALTER TABLE "StoreEvents" DROP COLUMN "endEvent",
DROP COLUMN "eventStartTime";
