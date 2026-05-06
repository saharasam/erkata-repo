import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function findAllSubmittedRequests() {
  try {
    const submittedRequests = await prisma.upgradeRequest.findMany({
      where: {
        status: 'SUBMITTED',
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

    console.log(JSON.stringify(submittedRequests, null, 2));
  } catch (error) {
    console.error('Error finding requests:', error);
  } finally {
    await prisma.$disconnect();
  }
}

findAllSubmittedRequests();
