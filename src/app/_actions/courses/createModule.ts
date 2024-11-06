"use server"
import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

type ModuleProps = {
  title: string;
  courseId: string;
}

// Exemplo de uso do modelo ModuleOrder
export const createModule = async (data: ModuleProps) => {
  const newModule = await db.module.create({
      data: {
          title: data.title,
          courseId: data.courseId,
      },
  });

  const lastOrder = await db.moduleOrder.findFirst({
      where: { courseId: data.courseId },
      orderBy: { order: 'desc' },
  });

  const nextOrder = lastOrder ? lastOrder.order + 1 : 1;

  await db.moduleOrder.create({
      data: {
          courseId: data.courseId,
          moduleId: newModule.id,
          order: nextOrder,
      },
  });

  return newModule;
};
