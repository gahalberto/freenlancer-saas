/*
  Warnings:

  - You are about to drop the column `address` on the `Stores` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Stores" DROP COLUMN "address",
ALTER COLUMN "address_zipcode" DROP DEFAULT,
ALTER COLUMN "address_street" DROP DEFAULT,
ALTER COLUMN "adress_number" DROP DEFAULT,
ALTER COLUMN "address_neighbor" DROP DEFAULT,
ALTER COLUMN "address_city" DROP DEFAULT,
ALTER COLUMN "address_state" DROP DEFAULT;
