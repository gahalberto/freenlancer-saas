/*
  Warnings:

  - Added the required column `address_city` to the `Stores` table without a default value. This is not possible if the table is not empty.
  - Added the required column `address_neighbor` to the `Stores` table without a default value. This is not possible if the table is not empty.
  - Added the required column `address_state` to the `Stores` table without a default value. This is not possible if the table is not empty.
  - Added the required column `address_street` to the `Stores` table without a default value. This is not possible if the table is not empty.
  - Added the required column `address_zipcode` to the `Stores` table without a default value. This is not possible if the table is not empty.
  - Added the required column `adress_number` to the `Stores` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "EventsServices" ALTER COLUMN "transport_price" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Stores" ADD COLUMN "address_zipcode" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Stores" ADD COLUMN "address_street" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Stores" ADD COLUMN "adress_number" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Stores" ADD COLUMN "address_neighbor" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Stores" ADD COLUMN "address_city" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Stores" ADD COLUMN "address_state" TEXT NOT NULL DEFAULT '';