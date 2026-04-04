import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const prisma = new PrismaClient();

async function main() {
  const profiles = await prisma.profile.findMany({
    select: {
      email: true,
      role: true,
      fullName: true,
      aglpBalance: true,
      aglpPending: true,
      aglpWithdrawn: true,
      tier: true,
    }
  });

  console.table(profiles.map(p => ({
    ...p,
    aglpBalance: p.aglpBalance.toString(),
    aglpPending: p.aglpPending.toString(),
    aglpWithdrawn: p.aglpWithdrawn.toString(),
  })));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
