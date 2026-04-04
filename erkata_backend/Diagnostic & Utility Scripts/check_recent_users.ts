import { PrismaClient } from '@prisma/client';

async function main() {
  const prisma = new PrismaClient();
  const users = await prisma.profile.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5,
    select: {
      email: true,
      role: true,
      fullName: true,
      createdAt: true,
    },
  });
  console.log(JSON.stringify(users, null, 2));
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
