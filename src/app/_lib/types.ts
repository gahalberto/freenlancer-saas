import { PrismaClient } from '@prisma/client'

declare global {
  // Estendendo PrismaClient para incluir o modelo absenceJustification
  namespace PrismaClient {
    interface PrismaClient {
      absenceJustification: any;
    }
  }
}

export {} 