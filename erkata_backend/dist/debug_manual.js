"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const IP_URL = 'postgresql://postgres.mpufgkovosjvrufxkckw:raqznkrVLNouGEze@18.202.64.2:6543/postgres?pgbouncer=true&sslmode=require&connection_limit=5';
const prisma = new client_1.PrismaClient({
    datasources: {
        db: { url: IP_URL },
    },
});
async function main() {
    const matchId = 'db1c3f2f-ad36-444b-a730-4de796054900';
    console.log(`Checking match: ${matchId}`);
    try {
        const match = await prisma.match.findUnique({
            where: { id: matchId },
            include: {
                agent: true,
                request: true,
            },
        });
        if (match) {
            console.log(`FOUND MATCH!`);
            const agent = match.agent;
            const request = match.request;
            console.log(`- Agent: ${agent.fullName} (${agent.id})`);
            console.log(`- Request: ${request.description} (${request.id})`);
            console.log(`- Status: ${match.status}`);
            console.log('\nScanning recent matches for this agent:');
            const allMatches = await prisma.match.findMany({
                where: { agentId: agent.id },
                include: { request: true },
                orderBy: { assignedAt: 'desc' },
            });
            allMatches.forEach((m) => {
                console.log(`  - Match ${m.id} [${m.status}] -> Req: ${m.request.description}`);
            });
        }
        else {
            console.log('Match not found.');
        }
    }
    catch (err) {
        console.error('Query failed:', err);
    }
}
main().finally(() => prisma.$disconnect());
//# sourceMappingURL=debug_manual.js.map