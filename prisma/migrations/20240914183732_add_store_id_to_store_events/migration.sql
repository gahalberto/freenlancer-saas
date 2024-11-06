/*
  Warnings:

  - You are about to drop the column `StoreId` on the `StoreEvents` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "StoreEvents" DROP COLUMN "StoreId",
ADD COLUMN     "storeId" TEXT NOT NULL DEFAULT '';

-- AddForeignKey
ALTER TABLE "StoreEvents" ADD CONSTRAINT "StoreEvents_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Stores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
