import { InviteService } from './invite.service';
export declare class InviteController {
    private readonly inviteService;
    constructor(inviteService: InviteService);
    getInvite(token: string): Promise<{
        email: string;
        fullName: string;
        phone: string;
        role: import(".prisma/client").$Enums.UserRole;
    }>;
}
