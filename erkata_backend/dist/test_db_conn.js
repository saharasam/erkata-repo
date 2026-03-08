"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
async function testConnection(url, label) {
    console.log(`Testing ${label}...`);
    const prisma = new client_1.PrismaClient({
        datasources: {
            db: { url },
        },
    });
    try {
        await prisma.$connect();
        console.log(`✅ ${label} Success!`);
        await prisma.$queryRaw `SELECT 1`;
        console.log(`✅ ${label} Query Success!`);
    }
    catch (err) {
        console.error(`❌ ${label} Failed: ${err.message}`);
    }
    finally {
        await prisma.$disconnect();
    }
}
async function main() {
    const password = 'raqznkrVLNouGEze';
    await testConnection(`postgresql://postgres.mpufgkovosjvrufxkckw:${password}@18.202.64.2:6543/postgres?pgbouncer=true&sslmode=require`, 'Old IP (PgBouncer)');
    await testConnection(`postgresql://postgres.mpufgkovosjvrufxkckw:${password}@108.128.216.176:6543/postgres?pgbouncer=true&sslmode=require`, 'New IP (PgBouncer)');
    await testConnection(`postgresql://postgres.mpufgkovosjvrufxkckw:${password}@aws-0-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require`, 'Hostname (PgBouncer)');
    await testConnection(`postgresql://postgres:${password}@db.mpufgkovosjvrufxkckw.supabase.co:5432/postgres?sslmode=require`, 'Direct Hostname');
}
main();
//# sourceMappingURL=test_db_conn.js.map