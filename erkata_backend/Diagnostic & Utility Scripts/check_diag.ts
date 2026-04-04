import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const prisma = new PrismaClient();

async function main() {
  console.log('--- System Configs ---');
  const configs = await prisma.systemConfig.findMany();
  console.table(configs);

  console.log('--- Matches Status ---');
  const matches = await prisma.match.findMany({
    include: {
      agent: { select: { fullName: true, email: true } },
      request: true,
    }
  });
  console.table(matches.map(m => ({
    id: m.id.substring(0, 8),
    agent: m.agent.fullName,
    email: m.agent.email,
    status: m.status,
    budget: m.request.budgetMax?.toString() || m.request.budgetMin?.toString() || '0',
  })));

  console.log('--- Profile AGLP Balances ---');
  const profiles = await prisma.profile.findMany({
    where: { role: 'agent' },
    select: {
      email: true,
      fullName: true,
      aglpBalance: true,
      tier: true,
    }
  });
  console.table(profiles.map(p => ({
    ...p,
    aglpBalance: p.aglpBalance.toString(),
  })));

  console.log('--- Packages ---');
  const packages = await prisma.package.findMany();
  console.table(packages.map(p => ({
    ...p,
    price: p.price.toString(),
  })));

  console.log('--- AGLP Transactions ---');
  const txs = await prisma.aglpTransaction.findMany();
  console.table(txs);

  console.log('--- Audit Logs (Finance Related) ---');
  const logs = await prisma.auditLog.findMany({
    where: {
      action: {
        contains: 'EARNED'
      }
    },
    take: 20,
    orderBy: { createdAt: 'desc' }
  });
  console.table(logs);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
