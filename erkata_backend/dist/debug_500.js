"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const transactions_service_1 = require("./src/transactions/transactions.service");
const users_service_1 = require("./src/users/users.service");
const event_emitter_1 = require("@nestjs/event-emitter");
const prisma = new client_1.PrismaClient();
const eventEmitter = new event_emitter_1.EventEmitter2();
const prismaService = prisma;
async function testServices() {
    const agentId = '281813e7-e3f4-44bc-b135-5ab9ca0e4fde';
    const transactionsService = new transactions_service_1.TransactionsService(prismaService, eventEmitter);
    const usersService = new users_service_1.UsersService(prismaService);
    console.log('--- Testing TransactionsService.getAgentJobs ---');
    try {
        const jobs = await transactionsService.getAgentJobs(agentId);
        console.log(`Success: Found ${jobs.length} jobs`);
    }
    catch (err) {
        console.error('FAILED TransactionsService.getAgentJobs:');
        console.error(err);
    }
    console.log('\n--- Testing UsersService.getFinanceSummary ---');
    try {
        const finance = await usersService.getFinanceSummary(agentId);
        console.log('Success: Finance summary retrieved');
        console.log(JSON.stringify(finance, null, 2));
    }
    catch (err) {
        console.error('FAILED UsersService.getFinanceSummary:');
        console.error(err);
    }
}
testServices().finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=debug_500.js.map