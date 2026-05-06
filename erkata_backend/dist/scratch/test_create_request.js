"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function testCreateRequest() {
    const customerId = '7307fc8e-950e-4a70-ac13-da2761f8bbcb';
    const dto = {
        category: 'Home',
        type: 'real_estate',
        details: {
            description: 'Test description',
            budget: 5000000,
        },
        metadata: {
            intent: 'buy',
        },
        locationZone: {
            kifleKetema: 'Addis Ketema',
            woreda: 'Woreda 01',
        },
    };
    console.log('DTO:', JSON.stringify(dto, null, 2));
    const budget = dto.details.budget !== undefined ? Number(dto.details.budget) : undefined;
    console.log('Parsed budget:', budget);
    const zone = await prisma.zone.findFirst();
    if (!zone) {
        console.error('Invalid zone');
        return;
    }
    const request = await prisma.request.create({
        data: {
            customerId,
            category: dto.category,
            type: dto.type || 'real_estate',
            description: dto.details.description,
            budget: budget,
            metadata: dto.metadata || {},
            zoneId: zone.id,
            woreda: dto.locationZone.woreda,
            status: 'pending',
        },
    });
    console.log('Created request:', JSON.stringify(request, null, 2));
}
testCreateRequest()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
//# sourceMappingURL=test_create_request.js.map