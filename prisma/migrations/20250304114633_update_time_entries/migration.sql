/*
  Warnings:

  - You are about to drop the column `data_hora` on the `time_entries` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `time_entries` table. All the data in the column will be lost.
  - Added the required column `entrace` to the `time_entries` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "time_entries" DROP COLUMN "data_hora",
DROP COLUMN "type",
ADD COLUMN     "entrace" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "exit" TIMESTAMP(3),
ADD COLUMN     "lunchEntrace" TIMESTAMP(3),
ADD COLUMN     "lunchExit" TIMESTAMP(3);

-- DropEnum
DROP TYPE "TYPE_ENTRIES";
