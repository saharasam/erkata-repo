import { PrismaService } from '../prisma/prisma.service';
import { Notification } from '@prisma/client';
export declare class NotificationsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(data: {
        userId: string;
        title: string;
        message: string;
        type: string;
        link?: string;
    }): Promise<Notification>;
    getForUser(userId: string): Promise<Notification[]>;
    markAsRead(id: string, userId: string): Promise<any>;
    markAllAsRead(userId: string): Promise<any>;
}
