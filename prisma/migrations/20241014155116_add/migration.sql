-- AlterTable
ALTER TABLE "EventsServices" ALTER COLUMN "reallyMashguiachArrive" DROP NOT NULL,
ALTER COLUMN "reallyMashguiachArrive" DROP DEFAULT,
ALTER COLUMN "reallyMashguiachEndTime" DROP NOT NULL,
ALTER COLUMN "reallyMashguiachEndTime" DROP DEFAULT;
