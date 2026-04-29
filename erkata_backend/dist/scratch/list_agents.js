"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    const agents = await prisma.profile.findMany({
        where: { role: 'agent' },
        include: {
            package: true,
            referredBy: {
                select: {
                    fullName: true
                }
            }
        },
        orderBy: { createdAt: 'desc' }
    });
    console.log(`Total Agents: ${agents.length}\n`);
    console.log('| Name | Phone | Tier | Referred By | Joined At |');
    console.log('|------|-------|------|-------------|-----------|');
    agents.forEach(a => {
        console.log(`| ${a.fullName} | ${a.phone} | ${a.package?.displayName || a.tier} | ${a.referredBy?.fullName || '-'} | ${a.createdAt.toISOString().split('T')[0]} |`);
    });
}
main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
//# sourceMappingURL=list_agents.js.map