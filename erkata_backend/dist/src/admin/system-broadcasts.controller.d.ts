import { PrismaService } from '../prisma/prisma.service';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import { NotificationsService } from '../notifications/notifications.service';
interface AuthenticatedRequest {
    user: {
        id: string;
        role: string;
    };
}
export default class SystemBroadcastsController {
    private prisma;
    private notificationsGateway;
    private notificationsService;
    constructor(prisma: PrismaService, notificationsGateway: NotificationsGateway, notificationsService: NotificationsService);
    getBroadcasts(req: AuthenticatedRequest): Promise<{
        id: string;
        createdAt: Date;
        content: string | null;
        title: string;
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
            content: string | null;
            title: string;
            target: string;
        };
    }>;
    deleteBroadcast(id: string): Promise<{
        message: string;
    }>;
}
export {};
