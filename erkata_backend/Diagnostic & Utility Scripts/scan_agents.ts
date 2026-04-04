import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Scanning All Agents and Matches ---');

  const agents = await prisma.profile.findMany({
    where: { role: 'agent' },
    select: { id: true, fullName: true, phone: true },
  });

  for (const agent of agents) {
    const matches = await prisma.match.findMany({
      where: { agentId: agent.id },
      include: {
        request: true,
      },
    });
    console.log(
      `Agent: ${agent.fullName} (${agent.id}) - Phone: ${agent.phone} - Matches: ${matches.length}`,
    );
    matches.forEach((m) => {
      console.log(
        `  - Match ${m.id} [${m.status}] -> Req ${m.request.id} [${m.request.status}]: ${m.request.description}`,
      );
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
