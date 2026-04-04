import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const prisma = new PrismaClient();

async function main() {
  const matches = await prisma.match.findMany({
    include: {
      agent: { select: { fullName: true } },
      request: true,
    },
  });

  console.table(
    matches.map((m) => ({
      id: m.id.substring(0, 8),
      agent: m.agent.fullName,
      status: m.status,
      budgetMax: m.request.budgetMax?.toString() || '0',
    })),
  );
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
