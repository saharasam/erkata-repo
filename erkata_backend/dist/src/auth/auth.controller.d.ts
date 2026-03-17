import { AuthService } from './auth.service';
import type { Response, Request } from 'express';
export interface RegisterDto {
    email: string;
    fullName: string;
    password: string;
    role?: string;
    tier?: string;
    inviteToken?: string;
}
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(body: {
        identifier: string;
        password: string;
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
    refresh(req: Request): Promise<{
        accessToken: string;
    }>;
    logout(res: Response): Promise<{
        message: string;
    }>;
    register(body: RegisterDto): Promise<{
        message: string;
        userId: string;
        debugRole: string;
    }>;
}
