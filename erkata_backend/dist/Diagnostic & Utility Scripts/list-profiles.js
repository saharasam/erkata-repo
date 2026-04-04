"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
async function main() {
    const prisma = new client_1.PrismaClient();
    const profiles = await prisma.profile.findMany({
        select: {
            email: true,
            fullName: true,
            role: true
        }
    });
    console.log('EMAILS:');
    profiles.forEach(p => console.log(`- ${p.email} (${p.fullName}, ${p.role})`));
    await prisma.$disconnect();
}
main().catch(console.error);
//# sourceMappingURL=list-profiles.js.map