import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { Response } from 'express';
export declare class AuthService {
    private readonly prisma;
    private readonly jwtService;
    private supabaseAdmin;
    constructor(prisma: PrismaService, jwtService: JwtService);
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
    }): Promise<{
        message: string;
        userId: string;
    }>;
}
