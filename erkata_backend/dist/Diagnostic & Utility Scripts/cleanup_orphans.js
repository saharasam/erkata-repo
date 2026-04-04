"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function cleanupOrphans() {
    console.log('--- Starting One-Time Orphaned Profile Cleanup ---');
    const authUsers = await prisma.$queryRawUnsafe('SELECT id FROM auth.users');
    const authIds = new Set(authUsers.map((u) => u.id));
    const profiles = await prisma.profile.findMany({
        select: { id: true, fullName: true },
    });
    const orphans = profiles.filter((p) => !authIds.has(p.id));
    if (orphans.length === 0) {
        console.log('✅ No orphaned profiles found.');
        return;
    }
    console.log(`Found ${orphans.length} orphans to delete.`);
    for (const orphan of orphans) {
        console.log(`Cleaning up: ${orphan.fullName} (${orphan.id})...`);
        try {
            const orphanRequests = await prisma.request.findMany({
                where: { customerId: orphan.id },
                select: { id: true },
            });
            const requestIds = orphanRequests.map((r) => r.id);
            await prisma.$transaction([
                prisma.finalResolution.deleteMany({
                    where: { finalizedById: orphan.id },
                }),
                prisma.resolutionProposal.deleteMany({
                    where: { proposedById: orphan.id },
                }),
                prisma.feedback.deleteMany({ where: { authorId: orphan.id } }),
                prisma.transaction.deleteMany({
                    where: { match: { requestId: { in: requestIds } } },
                }),
                prisma.match.deleteMany({ where: { requestId: { in: requestIds } } }),
                prisma.match.deleteMany({
                    where: { OR: [{ agentId: orphan.id }, { operatorId: orphan.id }] },
                }),
                prisma.request.deleteMany({ where: { customerId: orphan.id } }),
                prisma.agentZone.deleteMany({ where: { agentId: orphan.id } }),
                prisma.referralLink.deleteMany({ where: { referrerId: orphan.id } }),
                prisma.auditLog.deleteMany({ where: { actorId: orphan.id } }),
                prisma.profile.delete({ where: { id: orphan.id } }),
            ]);
            console.log(`✅ Deleted ${orphan.fullName}`);
        }
        catch (e) {
            console.error(`❌ Failed to delete ${orphan.fullName}: ${e.message}`);
        }
    }
    console.log('✅ SUCCESS: Existing orphaned records removed.');
}
cleanupOrphans()
    .catch((e) => console.error('Cleanup Failed:', e))
    .finally(() => prisma.$disconnect());
//# sourceMappingURL=cleanup_orphans.js.map