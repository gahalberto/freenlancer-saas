/*
  Warnings:

  - Added the required column `address_neighbor` to the `EventsAdresses` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "EventsAdresses" ADD COLUMN     "address_neighbor" TEXT NOT NULL;
