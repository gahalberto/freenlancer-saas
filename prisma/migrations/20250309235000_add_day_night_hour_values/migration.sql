-- AlterTable
ALTER TABLE "EventsServices" ADD COLUMN "dayHourValue" FLOAT NOT NULL DEFAULT 50,
                            ADD COLUMN "nightHourValue" FLOAT NOT NULL DEFAULT 75; 