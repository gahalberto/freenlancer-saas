'use server'

import { db } from '@/app/_lib/prisma'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import { getServerSession } from 'next-auth'

export const addMashguiachFixedJob = async (userId: string, storeId: string, price: number) => {
  const session = await getServerSession(authOptions)
    console.log(userId, storeId, price)

    const alreadyHasAJob = await db.fixedJobs.findFirst({
        where: {
            user_id: userId,
            deletedAt: null,
        },
        include: {
            store: {
                select: {
                    title: true
                }
            }
        }
    })

    if(alreadyHasAJob){
        throw new Error(`Esse Mashguiach já tem um trabalho fixo em ${alreadyHasAJob.store.title}, remova-o antes de adicionar um novo.`)
    }
    
 return await db.fixedJobs.create({
    data: {
      user_id: userId,
      store_id: storeId,
      price,
    }
  })
}
