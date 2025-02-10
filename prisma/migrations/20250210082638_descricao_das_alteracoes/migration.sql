/*
  Warnings:

  - You are about to drop the column `address` on the `FixedJobs` table. All the data in the column will be lost.
  - You are about to drop the column `mashguiachId` on the `FixedJobs` table. All the data in the column will be lost.
  - You are about to drop the column `restaurant` on the `FixedJobs` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `FixedJobs` table. All the data in the column will be lost.
  - The `price` column on the `FixedJobs` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `WorkTime` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `store_id` to the `FixedJobs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `FixedJobs` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "FixedJobs" DROP CONSTRAINT "FixedJobs_mashguiachId_fkey";

-- DropForeignKey
ALTER TABLE "WorkTime" DROP CONSTRAINT "WorkTime_fixedJobId_fkey";

-- AlterTable
ALTER TABLE "FixedJobs" DROP COLUMN "address",
DROP COLUMN "mashguiachId",
DROP COLUMN "restaurant",
DROP COLUMN "title",
ADD COLUMN     "store_id" TEXT NOT NULL,
ADD COLUMN     "user_id" TEXT NOT NULL,
DROP COLUMN "price",
ADD COLUMN     "price" INTEGER,
ALTER COLUMN "observationText" DROP NOT NULL;

-- DropTable
DROP TABLE "WorkTime";

-- AddForeignKey
ALTER TABLE "FixedJobs" ADD CONSTRAINT "FixedJobs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
