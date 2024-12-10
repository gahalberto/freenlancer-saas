import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Array de roles a serem inseridas
  const roles = [{ name: 'Mashguiach' }, { name: 'Estabelecimento' }, { name: 'ADMIN' }]

  // Upsert roles no banco de dados
  for (const role of roles) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: {},
      create: role,
    })
  }

  console.log('Roles seeded!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
