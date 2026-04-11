"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('Starting Status Migration...');
    const matched = await prisma.request.updateMany({
        where: { status: 'matched' },
        data: { status: 'pending' },
    });
    console.log(`Migrated ${matched.count} "matched" -> "pending"`);
    const in_progress = await prisma.request.updateMany({
        where: { status: 'in_progress' },
        data: { status: 'assigned' },
    });
    console.log(`Migrated ${in_progress.count} "in_progress" -> "assigned"`);
    const completed = await prisma.request.updateMany({
        where: { status: 'completed' },
        data: { status: 'fulfilled' },
    });
    console.log(`Migrated ${completed.count} "completed" -> "fulfilled"`);
    const delivered = await prisma.request.updateMany({
        where: { status: 'delivered' },
        data: { status: 'fulfilled' },
    });
    console.log(`Migrated ${delivered.count} "delivered" -> "fulfilled"`);
    const escalated = await prisma.request.updateMany({
        where: { status: 'ESCALATED' },
        data: { status: 'disputed' },
    });
    console.log(`Migrated ${escalated.count} "ESCALATED" -> "disputed"`);
    const disputed = await prisma.request.updateMany({
        where: { status: 'DISPUTED' },
        data: { status: 'disputed' },
    });
    console.log(`Migrated ${disputed.count} "DISPUTED" -> "disputed"`);
    console.log('Migration Complete.');
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=migrate_statuses.js.map