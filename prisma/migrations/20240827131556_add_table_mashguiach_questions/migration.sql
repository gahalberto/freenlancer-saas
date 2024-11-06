-- AlterTable
ALTER TABLE "users" ADD COLUMN     "jewishName" TEXT;

-- CreateTable
CREATE TABLE "mashguiach_questions" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "jewishName" TEXT NOT NULL,
    "maritalStatus" INTEGER NOT NULL,
    "weddingLocation" TEXT,
    "wifeName" TEXT,
    "rabbiMarried" TEXT,
    "rabbi" TEXT,
    "currentSynagogue" TEXT,
    "shiur" TEXT,
    "daven" INTEGER NOT NULL,
    "jewishStudies" TEXT,
    "kashrutBooks" TEXT,
    "kashrutCourses" TEXT,
    "ashgachotWorked" TEXT,
    "kashrutLevel" INTEGER NOT NULL,
    "shomerShabat" BOOLEAN NOT NULL,
    "childrenSchool" TEXT,
    "wifeCoveredHair" INTEGER,
    "montherSingleName" TEXT,
    "giurInFamily" TEXT,
    "rabbiOfGiur" TEXT,

    CONSTRAINT "mashguiach_questions_pkey" PRIMARY KEY ("id")
);
