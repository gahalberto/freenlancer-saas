-- AlterTable
ALTER TABLE "users" ADD COLUMN     "address_neighbor" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "address_number" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "address_state" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "address_street" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "address_zicode" TEXT NOT NULL DEFAULT '';
