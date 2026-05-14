import { AuthService } from './auth.service';
import type { Response } from 'express';
import type { AuthenticatedRequest } from './guards/authenticated-request.interface';
import { RedisPresenceService } from '../common/redis/redis-presence.service';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
export declare class AuthController {
    private readonly authService;
    private readonly presence;
    private readonly prisma;
    constructor(authService: AuthService, presence: RedisPresenceService, prisma: PrismaService);
    login(body: {
        identifier: string;
        password: string;
    }, res: Response, req: any): Promise<{
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
    refresh(req: any): Promise<{
        accessToken: string;
    }>;
    logout(res: Response): Promise<{
        message: string;
    }>;
    register(body: RegisterDto, res: Response, req: any): Promise<{
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
    heartbeat(req: AuthenticatedRequest): Promise<{
        status: string;
        assignmentFound: boolean;
        requestId: string | null;
    }>;
}
