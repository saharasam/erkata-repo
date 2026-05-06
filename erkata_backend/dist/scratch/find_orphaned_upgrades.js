"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function findOrphanedRequests() {
    try {
        const orphanedRequests = await prisma.upgradeRequest.findMany({
            where: {
                status: 'SUBMITTED',
                proofUrl: null,
            },
            include: {
                agent: {
                    select: {
                        fullName: true,
                        email: true,
                    }
                }
            }
        });
        console.log(JSON.stringify(orphanedRequests, null, 2));
    }
    catch (error) {
        console.error('Error finding orphaned requests:', error);
    }
    finally {
        await prisma.$disconnect();
    }
}
findOrphanedRequests();
//# sourceMappingURL=find_orphaned_upgrades.js.map