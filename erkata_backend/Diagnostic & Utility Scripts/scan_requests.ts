import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface RequestWithMatches {
  id: string;
  status: string;
  description: string | null;
  category: string;
  createdAt: Date;
  matches: Array<{
    status: string;
    agent: {
      fullName: string;
      phone: string;
    };
  }>;
}

async function main() {
  console.log('--- Scanning Recent Requests ---');
  const requests = await prisma.request.findMany({
    orderBy: { createdAt: 'desc' },
    take: 10,
    include: {
      matches: {
        include: {
          agent: {
            select: { fullName: true, phone: true },
          },
        },
      },
    },
  });

  for (const r of requests as unknown as RequestWithMatches[]) {
    console.log(
      `Request ${r.id} [${r.status}] - Description: ${r.description}`,
    );
    console.log(
      `  - Category: ${r.category}, Created: ${r.createdAt.toISOString()}`,
    );
    if (r.matches && r.matches.length > 0) {
      r.matches.forEach((m) => {
        console.log(
          `    -> Assigned to Agent: ${m.agent.fullName} (${m.agent.phone}) [Match Status: ${m.status}]`,
        );
      });
    } else {
      console.log('    -> No agents assigned.');
    }
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
