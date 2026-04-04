import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanupOrphans() {
  console.log('--- Starting One-Time Orphaned Profile Cleanup ---');

  // 1. Get all valid Auth IDs
  const authUsers = await prisma.$queryRawUnsafe<any[]>(
    'SELECT id FROM auth.users',
  );
  const authIds = new Set(authUsers.map((u) => u.id));

  // 2. Find Profiles that don't have a matching Auth ID
  const profiles = await prisma.profile.findMany({
    select: { id: true, fullName: true },
  });
  const orphans = profiles.filter((p) => !authIds.has(p.id));

  if (orphans.length === 0) {
    console.log('✅ No orphaned profiles found.');
    return;
  }

  console.log(`Found ${orphans.length} orphans to delete.`);

  for (const orphan of orphans) {
    console.log(`Cleaning up: ${orphan.fullName} (${orphan.id})...`);

    try {
      // Find all requests where this orphan was the customer
      const orphanRequests = await prisma.request.findMany({
        where: { customerId: orphan.id },
        select: { id: true },
      });
      const requestIds = orphanRequests.map((r) => r.id);

      await prisma.$transaction([
        // 1. Cleanup Feedback related stuff
        prisma.finalResolution.deleteMany({
          where: { finalizedById: orphan.id },
        }),
        prisma.resolutionProposal.deleteMany({
          where: { proposedById: orphan.id },
        }),
        prisma.feedback.deleteMany({ where: { authorId: orphan.id } }),

        // 2. Cleanup Matches and Transactions for their requests
        prisma.transaction.deleteMany({
          where: { match: { requestId: { in: requestIds } } },
        }),
        prisma.match.deleteMany({ where: { requestId: { in: requestIds } } }),

        // 3. Cleanup Matches as an Agent/Operator
        prisma.match.deleteMany({
          where: { OR: [{ agentId: orphan.id }, { operatorId: orphan.id }] },
        }),

        // 4. Cleanup Request itself
        prisma.request.deleteMany({ where: { customerId: orphan.id } }),

        // 5. Profile specifics
        prisma.agentZone.deleteMany({ where: { agentId: orphan.id } }),
        prisma.referralLink.deleteMany({ where: { referrerId: orphan.id } }),
        prisma.auditLog.deleteMany({ where: { actorId: orphan.id } }),

        // 6. Finally, the profile
        prisma.profile.delete({ where: { id: orphan.id } }),
      ]);
      console.log(`✅ Deleted ${orphan.fullName}`);
    } catch (e: any) {
      console.error(`❌ Failed to delete ${orphan.fullName}: ${e.message}`);
    }
  }

  console.log('✅ SUCCESS: Existing orphaned records removed.');
}

cleanupOrphans()
  .catch((e) => console.error('Cleanup Failed:', e))
  .finally(() => prisma.$disconnect());
