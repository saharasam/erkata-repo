"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    const requests = await prisma.request.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
    });
    console.log(JSON.stringify(requests, null, 2));
}
main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
//# sourceMappingURL=check_requests.js.map