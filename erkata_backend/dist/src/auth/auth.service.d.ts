import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { Response } from 'express';
import { InviteService } from './invite/invite.service';
export declare class AuthService {
    private readonly prisma;
    private readonly jwtService;
    private readonly inviteService;
    private supabaseAdmin;
    constructor(prisma: PrismaService, jwtService: JwtService, inviteService: InviteService);
    private sanitizePhone;
    login(credentials: {
        identifier: string;
        pass: string;
    }, res: Response): Promise<{
        user: {
            id: string;
            email: string | undefined;
            phone: string | undefined;
            fullName: string | undefined;
            role: any;
            tier: any;
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
        password: string;
        role?: string;
        tier?: string;
        inviteToken?: string;
    }): Promise<{
        message: string;
        userId: string;
    }>;
}
