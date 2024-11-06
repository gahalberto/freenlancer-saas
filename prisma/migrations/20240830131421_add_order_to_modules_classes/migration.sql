-- CreateTable
CREATE TABLE "ModuleOrder" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "ModuleOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LessonOrder" (
    "id" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "LessonOrder_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ModuleOrder_courseId_order_key" ON "ModuleOrder"("courseId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "ModuleOrder_moduleId_key" ON "ModuleOrder"("moduleId");

-- CreateIndex
CREATE UNIQUE INDEX "LessonOrder_moduleId_order_key" ON "LessonOrder"("moduleId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "LessonOrder_lessonId_key" ON "LessonOrder"("lessonId");

-- AddForeignKey
ALTER TABLE "ModuleOrder" ADD CONSTRAINT "ModuleOrder_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModuleOrder" ADD CONSTRAINT "ModuleOrder_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "Module"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonOrder" ADD CONSTRAINT "LessonOrder_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "Module"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonOrder" ADD CONSTRAINT "LessonOrder_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
