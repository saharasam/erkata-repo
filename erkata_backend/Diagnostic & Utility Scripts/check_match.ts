import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const matchId = 'db1c3f2f-ad36-444b-a730-4de796054900';
  console.log(`Checking match: ${matchId}`);

  try {
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        agent: true,
        request: true,
      },
    });

    if (match) {
      console.log(`Found Match!`);
      const agent = match.agent as any;
      const request = match.request as any;
      console.log(`- Agent: ${agent.fullName} (${agent.id})`);
      console.log(`- Request: ${request.description} (${request.id})`);
      console.log(`- Status: ${match.status}`);
    } else {
      console.log('Match not found.');
    }
  } catch (err) {
    console.error('Query failed:', err);
  }
}

main().finally(() => prisma.$disconnect());
