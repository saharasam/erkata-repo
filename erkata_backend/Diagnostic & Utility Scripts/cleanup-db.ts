import { PrismaClient } from '@prisma/client';

async function main() {
  const prisma = new PrismaClient();
  
  // Keep the owner's email
  const OWNER_EMAIL = 'samuel.sebsibe.s@gmail.com';
  
  console.log('Starting cleanup...');

  // Identify profiles to delete (everything except the owner)
  const profilesToDelete = await prisma.profile.findMany({
    where: {
      email: { not: OWNER_EMAIL }
    },
    select: { id: true, email: true }
  });

  const profileIds = profilesToDelete.map(p => p.id);
  
  console.log(`Deleting data related to ${profileIds.length} profiles...`);

  // Delete in order to avoid FK issues
  // 1. Final Resolutions
  await prisma.finalResolution.deleteMany({});
  
  // 2. Resolution Proposals
  await prisma.resolutionProposal.deleteMany({});
  
  // 3. Feedback Bundles
  await prisma.feedbackBundle.deleteMany({});
  
  // 4. Feedbacks
  await prisma.feedback.deleteMany({});
  
  // 5. Transactions
  await prisma.transaction.deleteMany({});
  
  // 6. Matches
  await prisma.match.deleteMany({});
  
  // 7. Requests
  await prisma.request.deleteMany({});
  
  // 8. Referral Links
  await prisma.referralLink.deleteMany({});
  
  // 9. Agent Zones
  await prisma.agentZone.deleteMany({});
  
  // 10. Audit Logs
  await prisma.auditLog.deleteMany({});
  
  // 11. Invites
  await prisma.invite.deleteMany({});
  
  // 12. AGLP Transactions
  await prisma.aglpTransaction.deleteMany({});
  
  // 13. Profiles (except owner)
  const result = await prisma.profile.deleteMany({
    where: {
      id: { in: profileIds }
    }
  });

  console.log(`Successfully deleted ${result.count} profiles and all related data.`);
  console.log('Cleanup finished.');
  
  await prisma.$disconnect();
}

main().catch(console.error);
