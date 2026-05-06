"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function checkConfig() {
    const config = await prisma.systemConfig.findUnique({
        where: { key: 'AGLP_TO_ETB_RATE' }
    });
    console.log('Conversion Rate Config:', config);
    const totalBalance = await prisma.profile.aggregate({
        _sum: { aglpBalance: true, aglpWithdrawn: true }
    });
    console.log('System Totals:', totalBalance);
    const txTotals = await prisma.aglpTransaction.groupBy({
        by: ['type', 'status'],
        _sum: { amount: true }
    });
    console.log('Transaction Totals:', JSON.stringify(txTotals, null, 2));
    await prisma.$disconnect();
}
checkConfig();
//# sourceMappingURL=check_totals.js.map