import { PrismaClient } from '@prisma/client';

async function testConnection(url: string, label: string) {
  console.log(`Testing ${label}...`);
  const prisma = new PrismaClient({
    datasources: {
      db: { url },
    },
  });
  try {
    await prisma.$connect();
    console.log(`✅ ${label} Success!`);
    await prisma.$queryRaw`SELECT 1`;
    console.log(`✅ ${label} Query Success!`);
  } catch (err: any) {
    console.error(`❌ ${label} Failed: ${err.message}`);
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  const password = 'raqznkrVLNouGEze';

  // Test 1: Previous IP (6543)
  await testConnection(
    `postgresql://postgres.mpufgkovosjvrufxkckw:${password}@18.202.64.2:6543/postgres?pgbouncer=true&sslmode=require`,
    'Old IP (PgBouncer)',
  );

  // Test 2: New IP found via nslookup (6543)
  await testConnection(
    `postgresql://postgres.mpufgkovosjvrufxkckw:${password}@108.128.216.176:6543/postgres?pgbouncer=true&sslmode=require`,
    'New IP (PgBouncer)',
  );

  // Test 3: Hostname (6543)
  await testConnection(
    `postgresql://postgres.mpufgkovosjvrufxkckw:${password}@aws-0-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require`,
    'Hostname (PgBouncer)',
  );

  // Test 4: Direct Hostname (5432)
  await testConnection(
    `postgresql://postgres:${password}@db.mpufgkovosjvrufxkckw.supabase.co:5432/postgres?sslmode=require`,
    'Direct Hostname',
  );
}

main();
