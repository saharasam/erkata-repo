"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
async function main() {
    const prisma = new client_1.PrismaClient({
        log: ['query', 'info', 'warn', 'error'],
    });
    console.log('Connecting to database...');
    try {
        await prisma.$connect();
        console.log('Connected successfully!');
        const result = await prisma.$queryRaw `SELECT 1`;
        console.log('Query result:', result);
    }
    catch (error) {
        console.error('Connection failed:', error);
    }
    finally {
        await prisma.$disconnect();
    }
}
main();
//# sourceMappingURL=test-db.js.map