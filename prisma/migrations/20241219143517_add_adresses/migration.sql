-- CreateTable
CREATE TABLE "EventsAdresses" (
    "id" TEXT NOT NULL,
    "storeEvent" TEXT NOT NULL,
    "address_zipcode" TEXT NOT NULL,
    "address_street" TEXT NOT NULL,
    "address_number" TEXT NOT NULL,
    "address_city" TEXT NOT NULL,
    "address_state" TEXT NOT NULL,

    CONSTRAINT "EventsAdresses_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "EventsAdresses" ADD CONSTRAINT "EventsAdresses_storeEvent_fkey" FOREIGN KEY ("storeEvent") REFERENCES "StoreEvents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
