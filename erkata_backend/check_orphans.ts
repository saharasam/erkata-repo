import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Checking Synchronization between Auth and Profiles ---');

  try {
    // Attempting to query auth.users directly via raw SQL
    const authUsers = await prisma.$queryRawUnsafe<any[]>(
      'SELECT id, email FROM auth.users',
    );
    console.log(`Auth Users count: ${authUsers.length}`);
    const authIds = new Set(authUsers.map((u) => u.id));

    const profiles = await prisma.profile.findMany({
      select: { id: true, fullName: true, role: true },
    });
    console.log(`Profiles count: ${profiles.length}`);

    console.log('\n--- Orphaned Profiles ---');
    profiles.forEach((p) => {
      if (!authIds.has(p.id)) {
        console.log(
          `Profile ${p.fullName} (${p.id}) is ORPHANED (No matching Auth User).`,
        );
      }
    });
  } catch (err: any) {
    console.error(`Error querying auth.users: ${err.message}`);
    console.log('Falling back to listing all agents...');
    const agents = await prisma.profile.findMany({
      where: { role: 'agent' },
      select: { id: true, fullName: true },
    });
    console.log('Current Agents in Profiles:');
    agents.forEach((a) => console.log(`- ${a.fullName} (${a.id})`));
  }
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
