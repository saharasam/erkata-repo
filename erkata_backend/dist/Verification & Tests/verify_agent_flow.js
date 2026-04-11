"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('--- Agent Flow Verification ---');
    const agent = await prisma.profile.findFirst({
        where: { role: 'agent' },
    });
    if (!agent) {
        console.error('No agent found in DB. Run seed first.');
        return;
    }
    console.log(`Using Agent: ${agent.fullName} (${agent.id})`);
    const jobsBefore = await prisma.match.findMany({
        where: { agentId: agent.id },
    });
    console.log(`Jobs before: ${jobsBefore.length}`);
    let request = await prisma.request.findFirst({
        where: { status: client_1.RequestStatus.pending },
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
                budgetMax: new client_1.Prisma.Decimal(50000),
                status: client_1.RequestStatus.pending,
                zoneId: zone.id,
                woreda: '01',
            },
        });
    }
    console.log(`Using Request: ${request.id}`);
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
        data: { status: client_1.RequestStatus.pending },
    });
    console.log(`Match created: ${match.id}`);
    console.log('Accepting assignment...');
    await prisma.$transaction(async (tx) => {
        await tx.match.update({
            where: { id: match.id },
            data: { status: 'accepted' },
        });
        await tx.request.update({
            where: { id: request.id },
            data: { status: client_1.RequestStatus.assigned },
        });
        await tx.transaction.upsert({
            where: { matchId: match.id },
            update: {},
            create: {
                matchId: match.id,
                amount: request?.budgetMax || new client_1.Prisma.Decimal(0),
                currency: 'ETB',
                status: 'pending',
            },
        });
    }, {
        timeout: 15000,
    });
    const transaction = await prisma.transaction.findUnique({
        where: { matchId: match.id },
    });
    if (transaction) {
        console.log('✅ Transaction created successfully!');
        console.log(`Transaction ID: ${transaction.id}, Amount: ${transaction.amount.toString()}`);
    }
    else {
        console.error('❌ Transaction was NOT created.');
    }
    const jobsAfter = await prisma.match.findMany({
        where: { agentId: agent.id },
        include: { transaction: true, request: { include: { zone: true } } },
    });
    const targetJob = jobsAfter.find((j) => j.id === match.id);
    if (targetJob?.transaction) {
        console.log('✅ Transaction correctly included in job list!');
    }
    else {
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
//# sourceMappingURL=verify_agent_flow.js.map