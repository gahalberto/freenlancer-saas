-- DropForeignKey
ALTER TABLE "ModuleOrder" DROP CONSTRAINT "ModuleOrder_courseId_fkey";

-- DropForeignKey
ALTER TABLE "ModuleOrder" DROP CONSTRAINT "ModuleOrder_moduleId_fkey";

-- DropIndex
DROP INDEX "ModuleOrder_courseId_order_key";

-- DropIndex
DROP INDEX "ModuleOrder_moduleId_key";

-- AddForeignKey
ALTER TABLE "ModuleOrder" ADD CONSTRAINT "ModuleOrder_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModuleOrder" ADD CONSTRAINT "ModuleOrder_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "Module"("id") ON DELETE CASCADE ON UPDATE CASCADE;
