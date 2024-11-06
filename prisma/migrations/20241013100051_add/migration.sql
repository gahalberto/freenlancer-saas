-- AlterTable
ALTER TABLE "EventsServices" ADD COLUMN     "paymentStatus" "TransactionStatus" NOT NULL DEFAULT 'Pending';
