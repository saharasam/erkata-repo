import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const profiles = await prisma.profile.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5,
    select: {
      email: true,
      role: true,
      fullName: true,
      createdAt: true,
    }
  });

  console.log('Recent registrations:');
  console.log(JSON.stringify(profiles, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
