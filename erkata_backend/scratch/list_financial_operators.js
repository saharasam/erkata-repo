
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const financialOperators = await prisma.profile.findMany({
    where: {
      role: 'financial_operator',
    },
    select: {
      fullName: true,
      email: true,
      phone: true,
      isActive: true,
      createdAt: true,
    },
  });

  console.log(JSON.stringify(financialOperators, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
