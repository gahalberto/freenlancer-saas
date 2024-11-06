-- CreateTable
CREATE TABLE "Stores" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "isMashguiach" BOOLEAN,
    "mashguiachId" TEXT,
    "storeTypeId" TEXT NOT NULL,

    CONSTRAINT "Stores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StoresType" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,

    CONSTRAINT "StoresType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StoreEvents" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "responsable" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "nrPax" INTEGER NOT NULL,
    "clientName" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "serviceType" TEXT NOT NULL,
    "eventStartTime" TIMESTAMP(3) NOT NULL,
    "endEvent" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StoreEvents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Events" (
    "id" TEXT NOT NULL,
    "StoreEventsId" TEXT NOT NULL,
    "MashguiachId" TEXT NOT NULL,
    "hoursQtd" TEXT NOT NULL,
    "arriveMashguiachTime" TIMESTAMP(3) NOT NULL,
    "endMashguiachTime" TIMESTAMP(3) NOT NULL,
    "isApproved" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Events_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Stores" ADD CONSTRAINT "Stores_storeTypeId_fkey" FOREIGN KEY ("storeTypeId") REFERENCES "StoresType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoreEvents" ADD CONSTRAINT "StoreEvents_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Events" ADD CONSTRAINT "Events_MashguiachId_fkey" FOREIGN KEY ("MashguiachId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Events" ADD CONSTRAINT "Events_StoreEventsId_fkey" FOREIGN KEY ("StoreEventsId") REFERENCES "StoreEvents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
