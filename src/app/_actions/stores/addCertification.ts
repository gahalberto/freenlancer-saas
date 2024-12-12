'use server'
import { db } from '@/app/_lib/prisma'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import { HashgachotTypeEnum } from '@prisma/client'
import { getServerSession } from 'next-auth'

export const addCertification = async (data: {
  storeId: string
  description: string
  englishDescription: string
  observation: string
  kasherLePessach: boolean
  issueDate: string // Certifique-se de que são strings no formato ISO
  validationDate: string
  type: HashgachotTypeEnum
}) => {
  const session = await getServerSession(authOptions)
  if (!session) throw new Error('Unauthorized')
  const userId = session.user.id
  return await db.certifications.create({
    data: {
      storeId: data.storeId,
      description: data.description,
      englishDescription: data.englishDescription,
      observation: data.observation,
      kasherLePessach: data.kasherLePessach,
      issueDate: new Date(data.issueDate), // Converte para Date se necessário
      validationDate: new Date(data.validationDate), // Converte para Date se necessário
      userId: userId, // Add the userId property
      HashgachotType: data.type, // Add the HashgachotType property
    },
  })
}
