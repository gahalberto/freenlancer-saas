"use server"
import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

export const getModulesById = async (courseId: string) => {
  const modules = await db.module.findMany({
    where: {
      courseId: courseId,
    },
    include: {
      ModuleOrder: true, // Inclui a relação com ModuleOrder
    },
  });

  // Ordena os módulos pelo campo 'order' dentro de 'ModuleOrder'
  const sortedModules = modules.sort((a, b) => {
    const orderA = a.ModuleOrder[0]?.order ?? 0;
    const orderB = b.ModuleOrder[0]?.order ?? 0;
    return orderA - orderB; // Ordena em ordem ascendente
  });

  return sortedModules;
};

// Exemplo de uso
const courseId = 'your-course-id';
getModulesById(courseId).then(modules => {
  console.log(modules);
}).catch(error => {
  console.error(error);
});
