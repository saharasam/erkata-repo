import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkAgentTiers() {
  try {
    const agent = await prisma.profile.findMany({
      where: {
        email: { contains: 'age' },
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        tier: true,
      }
    });

    console.log("Agent Tiers:", JSON.stringify(agent, null, 2));
  } catch (error) {
    console.error('Error finding agents:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAgentTiers();
