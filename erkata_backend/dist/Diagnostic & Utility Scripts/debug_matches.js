"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    const agentId = '281813e7-e3f4-44bc-b135-5ab9ca0e4fde';
    console.log(`Checking matches for Agent ID: ${agentId}`);
    const matches = await prisma.match.findMany({
        where: { agentId },
        include: {
            request: {
                select: {
                    id: true,
                    category: true,
                    description: true,
                    status: true,
                },
            },
        },
        orderBy: { assignedAt: 'desc' },
    });
    console.log(`Found ${matches.length} matches:`);
    matches.forEach((m) => {
        console.log(`- Match ${m.id}: Status: ${m.status}, Request Status: ${m.request.status}, Desc: ${m.request.description}`);
    });
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(() => {
    void prisma.$disconnect();
});
//# sourceMappingURL=debug_matches.js.map