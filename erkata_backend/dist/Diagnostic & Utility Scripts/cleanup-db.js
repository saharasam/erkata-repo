"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
async function main() {
    const prisma = new client_1.PrismaClient();
    const OWNER_EMAIL = 'samuel.sebsibe.s@gmail.com';
    console.log('Starting cleanup...');
    const profilesToDelete = await prisma.profile.findMany({
        where: {
            email: { not: OWNER_EMAIL }
        },
        select: { id: true, email: true }
    });
    const profileIds = profilesToDelete.map(p => p.id);
    console.log(`Deleting data related to ${profileIds.length} profiles...`);
    await prisma.finalResolution.deleteMany({});
    await prisma.resolutionProposal.deleteMany({});
    await prisma.feedbackBundle.deleteMany({});
    await prisma.feedback.deleteMany({});
    await prisma.transaction.deleteMany({});
    await prisma.match.deleteMany({});
    await prisma.request.deleteMany({});
    await prisma.referralLink.deleteMany({});
    await prisma.agentZone.deleteMany({});
    await prisma.auditLog.deleteMany({});
    await prisma.invite.deleteMany({});
    await prisma.aglpTransaction.deleteMany({});
    const result = await prisma.profile.deleteMany({
        where: {
            id: { in: profileIds }
        }
    });
    console.log(`Successfully deleted ${result.count} profiles and all related data.`);
    console.log('Cleanup finished.');
    await prisma.$disconnect();
}
main().catch(console.error);
//# sourceMappingURL=cleanup-db.js.map