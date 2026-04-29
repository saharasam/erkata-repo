
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const operators = await prisma.profile.findMany({
    where: {
      role: 'operator',
    },
    select: {
      fullName: true,
      email: true,
    },
  });

  console.log('Registered Operators:');
  console.table(operators);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
