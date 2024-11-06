/*
  Warnings:

  - You are about to drop the `Events` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Events" DROP CONSTRAINT "Events_MashguiachId_fkey";

-- DropForeignKey
ALTER TABLE "Events" DROP CONSTRAINT "Events_StoreEventsId_fkey";

-- DropForeignKey
ALTER TABLE "StoreEvents" DROP CONSTRAINT "StoreEvents_ownerId_fkey";

-- DropTable
DROP TABLE "Events";

-- CreateTable
CREATE TABLE "EventsServices" (
    "id" TEXT NOT NULL,
    "StoreEventsId" TEXT NOT NULL,
    "arriveMashguiachTime" TIMESTAMP(3) NOT NULL,
    "endMashguiachTime" TIMESTAMP(3) NOT NULL,
    "isApproved" BOOLEAN NOT NULL DEFAULT false,
    "mashguiachId" TEXT NOT NULL,
    "userId" TEXT,

    CONSTRAINT "EventsServices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MashguiachServices" (
    "id" TEXT NOT NULL,
    "ServiceId" TEXT NOT NULL,
    "MashguiachId" TEXT NOT NULL,
    "accepted" BOOLEAN NOT NULL DEFAULT false,
    "responseDate" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MashguiachServices_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MashguiachServices_ServiceId_MashguiachId_key" ON "MashguiachServices"("ServiceId", "MashguiachId");

-- AddForeignKey
ALTER TABLE "StoreEvents" ADD CONSTRAINT "StoreEvents_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventsServices" ADD CONSTRAINT "EventsServices_StoreEventsId_fkey" FOREIGN KEY ("StoreEventsId") REFERENCES "StoreEvents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventsServices" ADD CONSTRAINT "EventsServices_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MashguiachServices" ADD CONSTRAINT "MashguiachServices_MashguiachId_fkey" FOREIGN KEY ("MashguiachId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MashguiachServices" ADD CONSTRAINT "MashguiachServices_ServiceId_fkey" FOREIGN KEY ("ServiceId") REFERENCES "EventsServices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
