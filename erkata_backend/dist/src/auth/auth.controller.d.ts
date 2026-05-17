import { AuthService } from './auth.service';
import type { Response, Request } from 'express';
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
    }, res: Response, req: Request): Promise<{
        user: {
            id: string;
            email: string;
            phone: string;
            fullName: string;
            role: import(".prisma/client").$Enums.UserRole;
            tier: import(".prisma/client").$Enums.Tier;
        };
        accessToken: string;
        csrfToken: `${string}-${string}-${string}-${string}-${string}`;
    }>;
    refresh(req: Request, res: Response): Promise<{
        accessToken: string;
        csrfToken: `${string}-${string}-${string}-${string}-${string}`;
    }>;
    logout(res: Response): Promise<{
        message: string;
    }>;
    register(body: RegisterDto, res: Response, req: Request): Promise<{
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
        csrfToken: `${string}-${string}-${string}-${string}-${string}`;
    }>;
    heartbeat(req: AuthenticatedRequest): Promise<{
        status: string;
        assignmentFound: boolean;
        requestId: string | null;
    }>;
    getMe(req: AuthenticatedRequest): Promise<{
        id: string;
        email: string;
        fullName: string;
        phone: string;
        role: import(".prisma/client").$Enums.UserRole;
        tier: import(".prisma/client").$Enums.Tier;
        zoneId: string | null;
    }>;
}
