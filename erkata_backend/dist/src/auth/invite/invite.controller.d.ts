import { InviteService } from './invite.service';
import { UserRole } from '@prisma/client';
export declare class InviteController {
    private readonly inviteService;
    constructor(inviteService: InviteService);
    generateInvite(req: any, body: {
        email: string;
        role: UserRole;
    }): Promise<{
        message: string;
        inviteUrl: string;
        token: any;
    }>;
}
