/*
  Warnings:

  - Added the required column `price_per_hour` to the `FixedJobs` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "FixedJobs" ADD COLUMN     "price_per_hour" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "timeIn" TIMESTAMP(3),
ADD COLUMN     "timeOut" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "WorkSchedule" (
    "id" TEXT NOT NULL,
    "fixedJobId" TEXT NOT NULL,
    "dayOfWeek" TEXT NOT NULL,
    "timeIn" TEXT,
    "timeOut" TEXT,
    "isDayOff" BOOLEAN NOT NULL DEFAULT false,
    "sundayOff" INTEGER,

    CONSTRAINT "WorkSchedule_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "WorkSchedule" ADD CONSTRAINT "WorkSchedule_fixedJobId_fkey" FOREIGN KEY ("fixedJobId") REFERENCES "FixedJobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
