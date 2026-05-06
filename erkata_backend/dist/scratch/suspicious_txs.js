"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function audit() {
    const topTxs = await prisma.aglpTransaction.findMany({
        where: { type: 'EARN' },
        orderBy: { amount: 'desc' },
        take: 100,
        include: { profile: true },
    });
    console.log('Top 100 Earnings:');
    topTxs.forEach((tx) => {
        console.log(`${tx.profile.fullName}: ${tx.amount.toString()} AGLP (Date: ${tx.createdAt.toISOString()}, Ref: ${tx.referenceId})`);
    });
    const allRefs = await prisma.aglpTransaction.findMany({
        where: { type: 'EARN' },
        select: { referenceId: true },
    });
    const refCounts = {};
    allRefs.forEach((r) => {
        if (r.referenceId) {
            refCounts[r.referenceId] = (refCounts[r.referenceId] || 0) + 1;
        }
    });
    const duplicatedRefs = Object.entries(refCounts).filter(([, count]) => count > 1);
    console.log('\nDuplicated Reference IDs count:', duplicatedRefs.length);
    if (duplicatedRefs.length > 0) {
        console.log('Top 5 Duplicates:', duplicatedRefs.sort((a, b) => b[1] - a[1]).slice(0, 5));
    }
    await prisma.$disconnect();
}
void audit();
//# sourceMappingURL=suspicious_txs.js.map