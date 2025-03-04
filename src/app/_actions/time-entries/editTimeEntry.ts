"use server"

import { db } from "@/app/_lib/prisma"

interface UpdateData {
  id: number
  entrace?: Date
  exit?: Date
  lunchEntrace?: Date
  lunchExit?: Date
}

export const editTimeEntry = async (updateData: UpdateData) => {
  try {
    const updatedEntry = await db.timeEntries.update({
      where: {
        id: updateData.id,
      },
      data: {
        entrace: updateData.entrace,
        exit: updateData.exit,
        lunchEntrace: updateData.lunchEntrace,
        lunchExit: updateData.lunchExit,
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