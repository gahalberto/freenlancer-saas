/*
  Warnings:

  - You are about to drop the column `questionarioId` on the `users` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_questionarioId_fkey";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "questionarioId";

-- AddForeignKey
ALTER TABLE "mashguiach_questions" ADD CONSTRAINT "mashguiach_questions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
