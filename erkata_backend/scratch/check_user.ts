import { PrismaClient } from '@prisma/client';

async function checkUser() {
  const prisma = new PrismaClient();
  try {
    const user = await prisma.profile.findFirst({
        where: { role: 'agent' }
    });
    console.log('Agent User:', JSON.stringify(user));
  } catch (e) {
    console.error('Error fetching user:', e);
  } finally {
    await prisma.$disconnect();
  }
}

checkUser();
