import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function findNullProofRequests() {
  try {
    const nullProofRequests = await prisma.upgradeRequest.findMany({
      where: {
        proofUrl: null,
      },
    });

    console.log("Requests with null proofUrl:", JSON.stringify(nullProofRequests, null, 2));
  } catch (error) {
    console.error('Error finding requests:', error);
  } finally {
    await prisma.$disconnect();
  }
}

findNullProofRequests();
