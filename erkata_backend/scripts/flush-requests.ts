import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Starting database cleanup for testing...');

  try {
    // 1. Delete dependent models in reverse order
    console.log('🗑️ Clearing resolutions and proposals...');
    await prisma.finalResolution.deleteMany({});
    await prisma.resolutionProposal.deleteMany({});

    console.log('🗑️ Clearing feedback bundles and feedback...');
    await prisma.feedbackBundle.deleteMany({});
    await prisma.feedback.deleteMany({});

    console.log('🗑️ Clearing transactions...');
    await prisma.transaction.deleteMany({});

    console.log('🗑️ Clearing matches...');
    await prisma.match.deleteMany({});

    console.log('🗑️ Clearing notifications...');
    await prisma.notification.deleteMany({});

    console.log('🗑️ Clearing requests...');
    const requests = await prisma.request.deleteMany({});
    console.log(`✅ Deleted ${requests.count} requests.`);

    // 2. Reset Profile counters
    console.log('🔄 Resetting agent/operator performance counters...');
    await prisma.profile.updateMany({
      data: {
        warningCount: 0,
        missedAssignments: 0,
        lastAssignmentAt: null,
        isOnline: false, // Force offline for clean testing start
      },
    });

    console.log(
      '✨ Database cleanup complete. You have a clean slate for testing.',
    );
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
