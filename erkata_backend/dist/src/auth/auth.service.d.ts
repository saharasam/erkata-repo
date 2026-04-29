import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { Response } from 'express';
import { InviteService } from './invite/invite.service';
import { NotificationsGateway } from '../notifications/notifications.gateway';
export declare class AuthService {
    private readonly prisma;
    private readonly jwtService;
    private readonly inviteService;
    private readonly notificationsGateway;
    constructor(prisma: PrismaService, jwtService: JwtService, inviteService: InviteService, notificationsGateway: NotificationsGateway);
    private sanitizePhone;
    login(credentials: {
        identifier: string;
        pass: string;
    }, res: Response): Promise<{
        user: {
            id: string;
            email: string;
            phone: string;
            fullName: string;
            role: import(".prisma/client").$Enums.UserRole;
            tier: import(".prisma/client").$Enums.Tier;
        };
        accessToken: string;
    }>;
    refresh(refreshToken: string): Promise<{
        accessToken: string;
    }>;
    logout(res: Response): Promise<{
        message: string;
    }>;
    register(data: {
        email: string;
        fullName: string;
        phone: string;
        password: string;
        role?: string;
        tier?: string;
        inviteToken?: string;
        referralCode?: string;
    }, res?: Response): Promise<{
        message: string;
        user: {
            id: string;
            email: string;
            phone: string;
            fullName: string;
            role: import(".prisma/client").$Enums.UserRole;
            tier: import(".prisma/client").$Enums.Tier;
        };
        accessToken: string;
    }>;
}
