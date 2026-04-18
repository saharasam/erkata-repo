import { PrismaClient, Prisma, RequestStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Agent Flow Verification ---');

  // 1. Find an agent
  const agent = await prisma.profile.findFirst({
    where: { role: 'agent' },
  });

  if (!agent) {
    console.error('No agent found in DB. Run seed first.');
    return;
  }
  console.log(`Using Agent: ${agent.fullName} (${agent.id})`);

  // 2. Fetch Jobs (should be empty if new)
  const jobsBefore = await prisma.match.findMany({
    where: { agentId: agent.id },
  });
  console.log(`Jobs before: ${jobsBefore.length}`);

  // 3. Check for an unassigned request or create one
  let request = await prisma.request.findFirst({
    where: { status: RequestStatus.pending },
  });

  if (!request) {
    console.log('Creating test request...');
    const zone = await prisma.zone.findFirst();
    if (!zone) {
      console.error('No zone found. Seed zones first.');
      return;
    }

    const customer = await prisma.profile.findFirst({
      where: { role: 'customer' },
    });
    if (!customer) {
      console.error('No customer found. Seed customers first.');
      return;
    }

    request = await prisma.request.create({
      data: {
        customerId: customer.id,
        category: 'Real Estate',
        description: 'Test Verification Request',
        budgetMax: new Prisma.Decimal(50000),
        status: RequestStatus.pending,
        zoneId: zone.id,
        woreda: '01',
      },
    });
  }
  console.log(`Using Request: ${request.id}`);

  // 4. Assign Agent (simulate operator)
  const operator = await prisma.profile.findFirst({
    where: { role: 'operator' },
  });
  if (!operator) {
    console.error('No operator found.');
    return;
  }

  console.log('Assigning agent...');
  const match = await prisma.match.create({
    data: {
      requestId: request.id,
      agentId: agent.id,
      operatorId: operator.id,
      status: 'assigned',
    },
  });

  await prisma.request.update({
    where: { id: request.id },
    data: { status: RequestStatus.pending },
  });

  console.log(`Match created: ${match.id}`);

  // 5. Accept Assignment (The core logic we changed)
  console.log('Accepting assignment...');

  // Simulate the TransactionsService.acceptAssignment logic
  await prisma.$transaction(
    async (tx) => {
      await tx.match.update({
        where: { id: match.id },
        data: { status: 'accepted' },
      });
      await tx.request.update({
        where: { id: request.id },
        data: { status: RequestStatus.assigned },
      });
      await tx.transaction.upsert({
        where: { matchId: match.id },
        update: {},
        create: {
          matchId: match.id,
          amount: request?.budgetMax || new Prisma.Decimal(0),
          currency: 'ETB',
          status: 'pending',
        },
      });
    },
    {
      timeout: 15000,
    },
  );

  // 6. Verify Transaction exists
  const transaction = await prisma.transaction.findUnique({
    where: { matchId: match.id },
  });

  if (transaction) {
    console.log('✅ Transaction created successfully!');
    console.log(
      `Transaction ID: ${transaction.id}, Amount: ${transaction.amount.toString()}`,
    );
  } else {
    console.error('❌ Transaction was NOT created.');
  }

  // 7. Test getAgentJobs inclusion
  const jobsAfter = await prisma.match.findMany({
    where: { agentId: agent.id },
    include: { transaction: true, request: { include: { zone: true } } },
  });

  const targetJob = jobsAfter.find((j) => j.id === match.id);
  if (targetJob?.transaction) {
    console.log('✅ Transaction correctly included in job list!');
  } else {
    console.error('❌ Transaction missing from job list inclusion.');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
