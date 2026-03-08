"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    const id = 'db1c3f2f-ad36-444b-a730-4de796054900';
    console.log(`Searching for ID: ${id}`);
    const [req, match, tx, profile] = await Promise.all([
        prisma.request.findUnique({ where: { id } }),
        prisma.match.findUnique({ where: { id } }),
        prisma.transaction.findUnique({ where: { id } }),
        prisma.profile.findUnique({ where: { id } }),
    ]);
    if (req)
        console.log('Found in Request table');
    if (match)
        console.log('Found in Match table');
    if (tx)
        console.log('Found in Transaction table');
    if (profile)
        console.log('Found in Profile table');
    if (!req && !match && !tx && !profile) {
        console.log('ID not found in primary tables.');
    }
}
main().finally(() => prisma.$disconnect());
//# sourceMappingURL=check_id.js.map