/*
  Warnings:

  - You are about to drop the column `adress_number` on the `Stores` table. All the data in the column will be lost.
  - Added the required column `address_number` to the `Stores` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Stores" RENAME COLUMN "adress_number" TO "address_number";