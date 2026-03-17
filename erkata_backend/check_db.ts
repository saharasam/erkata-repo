
import { PrismaClient } from '@prisma/client';

async function main() {
  const prisma = new PrismaClient();
  const zones = await prisma.zone.findMany();
  console.log('Zones in DB:', zones);
  const profiles = await prisma.profile.findMany();
  console.log('Profiles in DB:', profiles.length);
  await prisma.$disconnect();
}

main();
