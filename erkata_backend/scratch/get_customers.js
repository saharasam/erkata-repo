const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const customers = await prisma.profile.findMany({
    where: { role: 'customer' },
    select: { id: true, fullName: true, phone: true, email: true }
  });
  console.log(JSON.stringify(customers, null, 2));
}

main().finally(() => prisma.$disconnect());
