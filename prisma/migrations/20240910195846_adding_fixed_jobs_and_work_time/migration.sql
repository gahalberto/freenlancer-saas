-- CreateEnum
CREATE TYPE "DaysOfWeek" AS ENUM ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "isFixed" BOOLEAN DEFAULT false,
ADD COLUMN     "storeId" TEXT;

-- CreateTable
CREATE TABLE "FixedJobs" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "restaurant" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "price" TEXT NOT NULL,
    "mashguiachId" TEXT NOT NULL,
    "observationText" TEXT NOT NULL,
    "workTimeId" TEXT NOT NULL,

    CONSTRAINT "FixedJobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkTime" (
    "id" SERIAL NOT NULL,
    "day" "DaysOfWeek" NOT NULL,
    "startTime" INTEGER NOT NULL,
    "endTime" INTEGER NOT NULL,
    "fixedJobId" TEXT NOT NULL,

    CONSTRAINT "WorkTime_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "FixedJobs" ADD CONSTRAINT "FixedJobs_mashguiachId_fkey" FOREIGN KEY ("mashguiachId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkTime" ADD CONSTRAINT "WorkTime_fixedJobId_fkey" FOREIGN KEY ("fixedJobId") REFERENCES "FixedJobs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
