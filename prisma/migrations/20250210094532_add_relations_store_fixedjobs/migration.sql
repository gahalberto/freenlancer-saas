-- AddForeignKey
ALTER TABLE "FixedJobs" ADD CONSTRAINT "FixedJobs_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "Stores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
