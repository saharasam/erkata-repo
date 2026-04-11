import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting Status Migration...');

  // 1. matched -> pending
  const matched = await prisma.request.updateMany({
    where: { status: 'matched' as any },
    data: { status: 'pending' as any },
  });
  console.log(`Migrated ${matched.count} "matched" -> "pending"`);

  // 2. in_progress -> assigned
  const in_progress = await prisma.request.updateMany({
    where: { status: 'in_progress' as any },
    data: { status: 'assigned' as any },
  });
  console.log(`Migrated ${in_progress.count} "in_progress" -> "assigned"`);

  // 3. completed -> fulfilled
  const completed = await prisma.request.updateMany({
    where: { status: 'completed' as any },
    data: { status: 'fulfilled' as any },
  });
  console.log(`Migrated ${completed.count} "completed" -> "fulfilled"`);

  // 4. delivered -> fulfilled
  const delivered = await prisma.request.updateMany({
    where: { status: 'delivered' as any },
    data: { status: 'fulfilled' as any },
  });
  console.log(`Migrated ${delivered.count} "delivered" -> "fulfilled"`);

  // 5. ESCALATED -> disputed
  const escalated = await prisma.request.updateMany({
    where: { status: 'ESCALATED' as any },
    data: { status: 'disputed' as any },
  });
  console.log(`Migrated ${escalated.count} "ESCALATED" -> "disputed"`);

  // 6. DISPUTED -> disputed (lowercase match)
  const disputed = await prisma.request.updateMany({
    where: { status: 'DISPUTED' as any },
    data: { status: 'disputed' as any },
  });
  console.log(`Migrated ${disputed.count} "DISPUTED" -> "disputed"`);

  console.log('Migration Complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
