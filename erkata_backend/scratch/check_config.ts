import { PrismaClient } from '@prisma/client';

async function checkConfig() {
  const prisma = new PrismaClient();
  try {
    const configs = await prisma.systemConfig.findMany();
    console.log('Current System Configs:');
    configs.forEach(c => {
      console.log(`${c.key}: ${JSON.stringify(c.value)}`);
    });
  } catch (e) {
    console.error('Error fetching configs:', e);
  } finally {
    await prisma.$disconnect();
  }
}

checkConfig();
