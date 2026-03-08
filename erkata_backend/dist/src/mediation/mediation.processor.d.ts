import { WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
export declare class MediationProcessor extends WorkerHost {
    private prisma;
    constructor(prisma: PrismaService);
    process(job: Job<unknown, unknown, string>): Promise<unknown>;
    private handleTimeout;
}
