"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function checkAgentTiers() {
    try {
        const agents = await prisma.profile.findMany({
            where: {
                role: 'agent',
            },
            select: {
                id: true,
                fullName: true,
                email: true,
                tier: true,
            }
        });
        console.log("Agent Tiers:", JSON.stringify(agents, null, 2));
    }
    catch (error) {
        console.error('Error finding agents:', error);
    }
    finally {
        await prisma.$disconnect();
    }
}
checkAgentTiers();
//# sourceMappingURL=check_agent_tiers.js.map