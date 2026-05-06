
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanup() {
  console.log('--- STARTING GLOBAL BALANCE CLEANUP ---');

  try {
    await prisma.$transaction(async (tx) => {
      // 1. Reset all agent balances
      const updateResult = await tx.profile.updateMany({
        where: { role: 'agent' },
        data: {
          aglpBalance: 0,
          aglpWithdrawn: 0,
        },
      });
      console.log(`Reset ${updateResult.count} agent profiles to 0 AGLP.`);

      // 2. Delete all AGLP transactions (to clear history)
      const txDeleteResult = await tx.aglpTransaction.deleteMany({});
      console.log(`Deleted ${txDeleteResult.count} AGLP transactions.`);

      // 3. Delete relevant audit logs
      const auditDeleteResult = await tx.auditLog.deleteMany({
        where: {
          action: {
            in: [
              'COMMISSION_EARNED',
              'REFERRAL_COMMISSION_EARNED',
              'REFERRAL_COMMISSION_CREDITED',
              'PAYOUT_REQUESTED',
              'PAYOUT_COMPLETED',
              'PAYOUT_REJECTED',
              'PAYOUT_CANCELLED',
              'PACKAGE_REWARD_EARNED',
              'PACKAGE_UPGRADE_SPENT',
              'SUSPICIOUS_COMMISSION'
            ]
          }
        }
      });
      console.log(`Deleted ${auditDeleteResult.count} financial audit logs.`);
    });

    console.log('--- CLEANUP SUCCESSFUL ---');
  } catch (error) {
    console.error('--- CLEANUP FAILED ---');
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanup();
