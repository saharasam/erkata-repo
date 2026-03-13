import { PrismaService } from '../prisma/prisma.service';
export default class SystemBroadcastsController {
    private prisma;
    constructor(prisma: PrismaService);
    getBroadcasts(): {
        id: string;
        title: string;
        content: string;
        target: string;
        createdAt: Date;
    }[];
    createBroadcast(data: {
        title: string;
        content?: string;
        target: string;
    }): {
        message: string;
        broadcast: {
            id: string;
            createdAt: Date;
            title: string;
            content?: string;
            target: string;
        };
    };
}
