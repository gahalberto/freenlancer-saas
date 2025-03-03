"use server"

import { db } from "@/app/_lib/prisma"
import { revalidatePath } from "next/cache"

export interface UpdateProfileData {
  name?: string
  email?: string
  phone?: string
  avatar_url?: string
}

export async function updateProfile(userId: string, data: UpdateProfileData) {
  try {
    const updatedUser = await db.user.update({
      where: { id: userId },
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        avatar_url: data.avatar_url
      }
    })

    revalidatePath('/app/profile')
    return updatedUser
  } catch (error: any) {
    console.error("Erro ao atualizar perfil:", error)
    throw new Error(error.message || "Erro ao atualizar o perfil")
  }
} 