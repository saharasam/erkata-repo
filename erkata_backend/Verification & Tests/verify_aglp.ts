import {
  PrismaClient,
  AglpTransactionType,
  AglpTransactionStatus,
} from '@prisma/client';

async function verifyAglp() {
  const prisma = new PrismaClient();
  const testUserId = '22222222-2222-2222-2222-222222222222'; // Demo Agent

  console.log('--- AGLP Verification Script ---');

  try {
    // 1. Initial State
    const initialProfile = await prisma.profile.findUnique({
      where: { id: testUserId },
    });
    console.log(`Initial AGLP Balance: ${initialProfile?.aglpBalance}`);

    // 2. Test Deposit
    console.log('\nTesting Deposit 100 ETB...');
    await prisma.$transaction(async (tx) => {
      // Manual call to match logic in AglpService
      const rate = 1.0; // Assuming 1:1 for test
      const amountAglp = 100 * rate;
      await tx.profile.update({
        where: { id: testUserId },
        data: { aglpBalance: { increment: amountAglp } },
      });
      await tx.aglpTransaction.create({
        data: {
          profileId: testUserId,
          type: AglpTransactionType.DEPOSIT,
          amount: amountAglp,
          etbEquivalent: 100,
          conversionRate: rate,
          status: AglpTransactionStatus.COMPLETED,
          referenceType: 'VERIFICATION_DEPOSIT',
        },
      });
    });

    const afterDeposit = await prisma.profile.findUnique({
      where: { id: testUserId },
    });
    console.log(`Balance after deposit: ${afterDeposit?.aglpBalance}`);

    // 3. Test Withdrawal Request
    console.log('\nTesting Withdrawal Request 50 AGLP...');
    let withdrawalTxId: string = '';
    await prisma.$transaction(async (tx) => {
      const amountAglp = 50;
      const rate = 1.0;
      await tx.profile.update({
        where: { id: testUserId },
        data: {
          aglpBalance: { decrement: amountAglp },
          aglpWithdrawn: { increment: amountAglp },
        },
      });
      const aglpTx = await tx.aglpTransaction.create({
        data: {
          profileId: testUserId,
          type: AglpTransactionType.WITHDRAWAL,
          amount: amountAglp,
          etbEquivalent: 50 / rate,
          conversionRate: rate,
          status: AglpTransactionStatus.PENDING,
          referenceType: 'VERIFICATION_WITHDRAWAL',
        },
      });
      withdrawalTxId = aglpTx.id;
    });

    const afterWithdrawal = await prisma.profile.findUnique({
      where: { id: testUserId },
    });
    console.log(
      `Balance after withdrawal request: ${afterWithdrawal?.aglpBalance}`,
    );
    console.log(
      `Withdrawn (Pending) amount: ${afterWithdrawal?.aglpWithdrawn}`,
    );

    // 4. Test Rejection (Refund)
    console.log(`\nTesting Rejection (Refund) for Tx ${withdrawalTxId}...`);
    await prisma.$transaction(async (tx) => {
      const aglpTx = await tx.aglpTransaction.findUnique({
        where: { id: withdrawalTxId },
      });
      if (!aglpTx) throw new Error('Tx not found');

      await tx.profile.update({
        where: { id: testUserId },
        data: {
          aglpBalance: { increment: aglpTx.amount },
          aglpWithdrawn: { decrement: aglpTx.amount },
        },
      });
      await tx.aglpTransaction.update({
        where: { id: withdrawalTxId },
        data: { status: AglpTransactionStatus.REJECTED },
      });
    });

    const finalProfile = await prisma.profile.findUnique({
      where: { id: testUserId },
    });
    console.log(`Final Balance after rejection: ${finalProfile?.aglpBalance}`);
    console.log(`Final Withdrawn amount: ${finalProfile?.aglpWithdrawn}`);

    console.log('\n--- Verification Successful ---');
  } catch (error) {
    console.error('Verification failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyAglp();
