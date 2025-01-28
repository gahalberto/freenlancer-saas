'use server'

import { db } from '@/app/_lib/prisma'

export const ChangeMashguiach = async (serviceId: string, mashguiachSelected: string | null) => {
  try {
    // If mashguiachSelected is null or an empty string, set mashguiachId to null
    const updateData = mashguiachSelected ? { mashguiachId: mashguiachSelected } : { mashguiachId: null };

    return await db.eventsServices.update({
      data: updateData,
      where: { id: serviceId }
    });
  } catch (error) {
    console.error("Error updating mashguiach:", error);
    throw error; // Re-throw the error to handle it in the calling function
  }
};