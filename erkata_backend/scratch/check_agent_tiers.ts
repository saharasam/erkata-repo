import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkAgentTiers() {
  try {
    const agents = await prisma.profile.findMany({
      where: {
        role: 'agent',
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        tier: true,
      }
    });

    console.log("Agent Tiers:", JSON.stringify(agents, null, 2));
  } catch (error) {
    console.error('Error finding agents:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAgentTiers();
