/*
  Warnings:

  - You are about to drop the column `asweredQuestions` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "asweredQuestions",
ADD COLUMN     "questionarioId" INTEGER NOT NULL DEFAULT 0;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_questionarioId_fkey" FOREIGN KEY ("questionarioId") REFERENCES "mashguiach_questions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
