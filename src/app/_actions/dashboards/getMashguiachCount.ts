'use server'

import { db } from '@/app/_lib/prisma'

export const getMashguiachCount = async () => {
  return await db.user.count({
    where: {
      roleId: 1,
    },
  })
}
