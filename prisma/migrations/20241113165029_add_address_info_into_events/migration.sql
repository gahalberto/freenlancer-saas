/*
  Warnings:

  - You are about to drop the column `address` on the `StoreEvents` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "StoreEvents" DROP COLUMN "address",
ADD COLUMN     "address_city" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "address_neighbor" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "address_number" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "address_state" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "address_street" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "address_zicode" TEXT NOT NULL DEFAULT '';
