import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const prisma = new PrismaClient();

async function main() {
  const transactions = await prisma.aglpTransaction.findMany({
    include: {
      profile: {
        select: {
          email: true,
          fullName: true,
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  console.table(transactions.map(t => ({
    id: t.id.substring(0, 8),
    email: t.profile.email,
    type: t.type,
    amount: t.amount.toString(),
    status: t.status,
    createdAt: t.createdAt.toISOString(),
  })),
);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
