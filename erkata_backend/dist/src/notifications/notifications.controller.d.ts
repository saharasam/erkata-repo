import { NotificationsService } from './notifications.service';
import type { RequestWithUser } from '../common/interfaces/request-with-user.interface';
export declare class NotificationsController {
    private readonly notificationsService;
    constructor(notificationsService: NotificationsService);
    getNotifications(req: RequestWithUser): Promise<{
        id: string;
        type: string;
        createdAt: Date;
        message: string;
        link: string | null;
        userId: string;
        title: string;
        read: boolean;
    }[]>;
    markAsRead(id: string, req: RequestWithUser): Promise<any>;
    markAllAsRead(req: RequestWithUser): Promise<any>;
}
