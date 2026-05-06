"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function findNullProofRequests() {
    try {
        const nullProofRequests = await prisma.upgradeRequest.findMany({
            where: {
                proofUrl: null,
            },
        });
        console.log("Requests with null proofUrl:", JSON.stringify(nullProofRequests, null, 2));
    }
    catch (error) {
        console.error('Error finding requests:', error);
    }
    finally {
        await prisma.$disconnect();
    }
}
findNullProofRequests();
//# sourceMappingURL=find_null_proof_upgrades.js.map