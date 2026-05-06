"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function findAllSubmittedRequests() {
    try {
        const submittedRequests = await prisma.upgradeRequest.findMany({
            where: {
                status: 'SUBMITTED',
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
        console.log(JSON.stringify(submittedRequests, null, 2));
    }
    catch (error) {
        console.error('Error finding requests:', error);
    }
    finally {
        await prisma.$disconnect();
    }
}
findAllSubmittedRequests();
//# sourceMappingURL=find_all_submitted.js.map