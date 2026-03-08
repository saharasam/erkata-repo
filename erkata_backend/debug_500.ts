import { PrismaClient } from '@prisma/client';
import { TransactionsService } from './src/transactions/transactions.service';
import { UsersService } from './src/users/users.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

const prisma = new PrismaClient();
const eventEmitter = new EventEmitter2();

// Mock PrismaService for the Nest services
const prismaService = prisma as any;

async function testServices() {
  const agentId = '281813e7-e3f4-44bc-b135-5ab9ca0e4fde'; // sam sum

  const transactionsService = new TransactionsService(
    prismaService,
    eventEmitter,
  );
  const usersService = new UsersService(prismaService);

  console.log('--- Testing TransactionsService.getAgentJobs ---');
  try {
    const jobs = await transactionsService.getAgentJobs(agentId);
    console.log(`Success: Found ${jobs.length} jobs`);
  } catch (err: any) {
    console.error('FAILED TransactionsService.getAgentJobs:');
    console.error(err);
  }

  console.log('\n--- Testing UsersService.getFinanceSummary ---');
  try {
    const finance = await usersService.getFinanceSummary(agentId);
    console.log('Success: Finance summary retrieved');
    console.log(JSON.stringify(finance, null, 2));
  } catch (err: any) {
    console.error('FAILED UsersService.getFinanceSummary:');
    console.error(err);
  }
}

testServices().finally(async () => {
  await prisma.$disconnect();
});
