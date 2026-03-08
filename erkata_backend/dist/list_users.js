"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('--- Listing All Users in Profiles Table ---');
    const users = await prisma.profile.findMany({
        select: {
            id: true,
            fullName: true,
            phone: true,
            role: true,
            tier: true,
            isActive: true,
            createdAt: true,
            walletBalance: true,
        },
        orderBy: { createdAt: 'desc' },
    });
    console.log(`Found ${users.length} users:`);
    console.table(users.map(u => ({
        ID: u.id,
        Name: u.fullName,
        Phone: u.phone,
        Role: u.role,
        Tier: u.tier,
        Active: u.isActive,
        Balance: u.walletBalance.toString(),
        Created: u.createdAt.toISOString()
    })));
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(() => {
    void prisma.$disconnect();
});
//# sourceMappingURL=list_users.js.map