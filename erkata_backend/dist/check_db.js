"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
async function main() {
    const prisma = new client_1.PrismaClient();
    const zones = await prisma.zone.findMany();
    console.log('Zones in DB:', zones);
    const profiles = await prisma.profile.findMany();
    console.log('Profiles in DB:', profiles.length);
    await prisma.$disconnect();
}
main();
//# sourceMappingURL=check_db.js.map