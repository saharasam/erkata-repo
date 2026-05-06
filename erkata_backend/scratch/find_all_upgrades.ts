import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function findSweptRequests() {
  try {
    const sweptRequests = await prisma.upgradeRequest.findMany({
      where: {
        status: 'REJECTED',
        internalNote: {
          contains: 'Auto-rejected'
        }
      },
      include: {
        agent: {
          select: {
            fullName: true,
            email: true,
          }
        }
      }
    });

    console.log("Swept requests:", JSON.stringify(sweptRequests, null, 2));

    const allRequests = await prisma.upgradeRequest.findMany({});
    console.log("All requests:", JSON.stringify(allRequests, null, 2));
  } catch (error) {
    console.error('Error finding requests:', error);
  } finally {
    await prisma.$disconnect();
  }
}

findSweptRequests();
