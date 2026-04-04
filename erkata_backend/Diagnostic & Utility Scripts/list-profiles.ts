import { PrismaClient } from '@prisma/client';

async function main() {
  const prisma = new PrismaClient();
  const profiles = await prisma.profile.findMany({
    select: {
      email: true,
      fullName: true,
      role: true
    }
  });
  console.log('EMAILS:');
  profiles.forEach(p => console.log(`- ${p.email} (${p.fullName}, ${p.role})`));
  await prisma.$disconnect();
}

main().catch(console.error);
