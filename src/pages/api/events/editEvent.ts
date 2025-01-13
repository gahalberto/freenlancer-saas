import { db } from '@/app/_lib/prisma'
import { getServerSession } from 'next-auth/next'
import { NextApiRequest, NextApiResponse } from 'next'
import { authOptions } from '../auth/[...nextauth]'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { data } = req.body

    const event = await db.storeEvents.update({
      where: {
        id: data.id,
      },
      data: {
        ...data,
      },
    })
    res.status(200).json(event)
  } catch (error) {
    throw new Error('Function not implemented.')
  }
}
