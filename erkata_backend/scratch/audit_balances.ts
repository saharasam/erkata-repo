
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function audit() {
  console.log('--- STARTING AUDIT ---');

  const profiles = await prisma.profile.findMany({
    where: {
        role: 'agent'
    }
  });

  for (const profile of profiles) {
    const transactions = await prisma.aglpTransaction.findMany({
      where: { profileId: profile.id, status: 'COMPLETED' }
    });

    const sumEarn = transactions
      .filter(t => t.type === 'EARN' || t.type === 'DEPOSIT')
      .reduce((acc, t) => acc + Number(t.amount), 0);
    
    const sumSpend = transactions
      .filter(t => t.type === 'SPEND_PACKAGE' || t.type === 'WITHDRAWAL')
      .reduce((acc, t) => acc + Number(t.amount), 0);

    const calculatedBalance = sumEarn - sumSpend;
    const actualBalance = Number(profile.aglpBalance);
    const discrepancy = actualBalance - calculatedBalance;

    if (Math.abs(discrepancy) > 0.01) {
      console.log(`User: ${profile.fullName} (${profile.id})`);
      console.log(`  Actual Balance: ${actualBalance}`);
      console.log(`  Calculated (from history): ${calculatedBalance}`);
      console.log(`  Discrepancy: ${discrepancy}`);
      
      // Check for duplicated transactions
      const counts: Record<string, number> = {};
      transactions.forEach(t => {
          const key = `${t.type}_${t.amount}_${t.referenceId}`;
          counts[key] = (counts[key] || 0) + 1;
      });
      const duplicates = Object.entries(counts).filter(([_, v]) => v > 1);
      if (duplicates.length > 0) {
          console.log(`  Potential Duplicates:`, duplicates);
      }
    }
  }

  console.log('--- AUDIT FINISHED ---');
  await prisma.$disconnect();
}

audit();
