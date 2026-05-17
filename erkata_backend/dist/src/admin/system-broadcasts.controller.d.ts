import { Queue } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
interface AuthenticatedRequest {
    user: {
        id: string;
        role: string;
    };
}
export default class SystemBroadcastsController {
    private prisma;
    private broadcastQueue;
    constructor(prisma: PrismaService, broadcastQueue: Queue);
    getBroadcasts(req: AuthenticatedRequest): Promise<{
        id: string;
        createdAt: Date;
        title: string;
        content: string | null;
        target: string;
    }[]>;
    createBroadcast(data: {
        title: string;
        content?: string;
        target: string;
    }): Promise<{
        message: string;
        broadcast: {
            id: string;
            createdAt: Date;
            title: string;
            content: string | null;
            target: string;
        };
    }>;
    deleteBroadcast(id: string): Promise<{
        message: string;
    }>;
}
export {};
