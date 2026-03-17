"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    const profiles = await prisma.profile.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
            email: true,
            role: true,
            fullName: true,
            createdAt: true,
        }
    });
    console.log('Recent registrations:');
    console.log(JSON.stringify(profiles, null, 2));
}
main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
//# sourceMappingURL=check_users.js.map