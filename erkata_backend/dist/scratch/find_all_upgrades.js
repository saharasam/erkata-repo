"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function findSweptRequests() {
    try {
        const sweptRequests = await prisma.upgradeRequest.findMany({
            where: {
                status: 'REJECTED',
                internalNote: {
                    contains: 'Auto-rejected'
                }
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
        console.log("Swept requests:", JSON.stringify(sweptRequests, null, 2));
        const allRequests = await prisma.upgradeRequest.findMany({});
        console.log("All requests:", JSON.stringify(allRequests, null, 2));
    }
    catch (error) {
        console.error('Error finding requests:', error);
    }
    finally {
        await prisma.$disconnect();
    }
}
findSweptRequests();
//# sourceMappingURL=find_all_upgrades.js.map