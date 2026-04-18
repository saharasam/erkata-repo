import { NotificationsService } from './notifications.service';
import type { RequestWithUser } from '../common/interfaces/request-with-user.interface';
export declare class NotificationsController {
    private readonly notificationsService;
    constructor(notificationsService: NotificationsService);
    getNotifications(req: RequestWithUser): Promise<{
        id: string;
        createdAt: Date;
        type: string;
        link: string | null;
        message: string;
        userId: string;
        title: string;
        read: boolean;
    }[]>;
    markAsRead(id: string, req: RequestWithUser): Promise<any>;
    markAllAsRead(req: RequestWithUser): Promise<any>;
}
