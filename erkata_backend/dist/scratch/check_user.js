"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
async function checkUser() {
    const prisma = new client_1.PrismaClient();
    try {
        const user = await prisma.profile.findFirst({
            where: { role: 'agent' }
        });
        console.log('Agent User:', JSON.stringify(user));
    }
    catch (e) {
        console.error('Error fetching user:', e);
    }
    finally {
        await prisma.$disconnect();
    }
}
checkUser();
//# sourceMappingURL=check_user.js.map