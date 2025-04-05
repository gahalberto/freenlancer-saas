'use server'

import { db } from '@/app/_lib/prisma'

export const finishAdminService = async (
  id: string, 
  paymentDate: Date,
  dayHourValue?: number,
  nightHourValue?: number,
  transportPrice?: number
) => {
  console.log(id, paymentDate, dayHourValue, nightHourValue, transportPrice)
  
  // Preparar os dados para atualização
  const updateData: any = {
    paymentStatus: 'Success',
    paymentDate,
  }
  
  // Adicionar valores opcionais se fornecidos
  if (dayHourValue !== undefined) {
    updateData.dayHourValue = dayHourValue
  }
  
  if (nightHourValue !== undefined) {
    updateData.nightHourValue = nightHourValue
  }
  
  if (transportPrice !== undefined) {
    updateData.transport_price = transportPrice
  }
  
  return await db.eventsServices.update({
    where: { id },
    data: updateData,
  })
}
