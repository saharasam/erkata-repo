"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function verifyEscrowFlow() {
    console.log('--- STARTING ESCROW VERIFICATION ---');
    const agent = await prisma.profile.findFirst({ where: { role: 'agent' } });
    if (!agent) {
        console.error('No agent found for testing');
        return;
    }
    const match = await prisma.match.findFirst({
        where: { agentId: agent.id, status: 'accepted' },
        include: { request: true },
    });
    if (!match) {
        console.error('No accepted match found for testing');
        return;
    }
    console.log(`Testing with Agent: ${agent.fullName} and Match: ${match.id}`);
    const escrowTxs = await prisma.aglpTransaction.findMany({
        where: { referenceType: 'COMMISSION_ESCROW', status: 'PENDING' },
    });
    console.log(`Found ${escrowTxs.length} pending escrow transactions.`);
    const configs = await prisma.systemConfig.findMany({
        where: {
            key: {
                in: [
                    'AGLP_COMMISSION_PACKAGE_REFERRAL',
                    'COMMISSION_REAL_ESTATE_PRIMARY',
                    'COMMISSION_FURNITURE_PRIMARY',
                ],
            },
        },
    });
    console.log('Dynamic Config Keys Seeded:');
    configs.forEach((c) => console.log(` - ${c.key}: ${JSON.stringify(c.value)}`));
    if (configs.length < 3) {
        console.error('CRITICAL: Commission configuration keys are missing!');
    }
    else {
        console.log('SUCCESS: Commission configuration keys are correctly seeded.');
    }
    console.log('--- VERIFICATION COMPLETE ---');
}
verifyEscrowFlow()
    .catch((e) => console.error(e))
    .finally(async () => await prisma.$disconnect());
//# sourceMappingURL=verify_v3_escrow.js.map