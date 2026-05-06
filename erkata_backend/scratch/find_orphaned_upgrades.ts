import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function findOrphanedRequests() {
  try {
    const orphanedRequests = await prisma.upgradeRequest.findMany({
      where: {
        status: 'SUBMITTED',
        proofUrl: null,
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

    console.log(JSON.stringify(orphanedRequests, null, 2));
  } catch (error) {
    console.error('Error finding orphaned requests:', error);
  } finally {
    await prisma.$disconnect();
  }
}

findOrphanedRequests();
