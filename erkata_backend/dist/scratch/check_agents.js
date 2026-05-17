"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
async function main() {
    const prisma = new client_1.PrismaClient();
    try {
        const agents = await prisma.profile.findMany({
            where: { role: 'agent' },
            include: {
                agentZones: {
                    include: { zone: true }
                }
            }
        });
        console.log('Total Agents:', agents.length);
        agents.forEach(agent => {
            console.log(`- ${agent.fullName} (Active: ${agent.isActive}, Tier: ${agent.tier})`);
            console.log(`  Zones: ${agent.agentZones.map(az => az.zone?.name || 'N/A').join(', ')}`);
        });
        const zones = await prisma.zone.findMany();
        console.log('\nTotal Zones:', zones.length);
        zones.forEach(z => console.log(`- ${z.name} (${z.id})`));
        const requests = await prisma.request.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: { zone: true }
        });
        console.log('\nRecent Requests:');
        requests.forEach(r => {
            console.log(`- ID: ${r.id}, Zone: ${r.zone?.name || 'N/A'} (${r.zoneId})`);
        });
    }
    catch (e) {
        console.error(e);
    }
    finally {
        await prisma.$disconnect();
    }
}
main();
//# sourceMappingURL=check_agents.js.map