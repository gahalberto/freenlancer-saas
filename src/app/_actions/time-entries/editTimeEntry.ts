"use server"

import { db } from "@/app/_lib/prisma"

export const editTimeEntry = async (
  entryId: number,
  newDateTime: Date,
) => {
  try {
    const updatedEntry = await db.timeEntries.update({
      where: {
        id: entryId,
      },
      data: {
        data_hora: newDateTime,
      },
    })

    return updatedEntry
  } catch (error: any) {
    console.error("Erro ao editar registro de tempo:", error)
    throw new Error(
      error.message ||
        "Não foi possível editar o registro. Por favor, tente novamente."
    )
  }
} 