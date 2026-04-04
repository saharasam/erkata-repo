import { PrismaService } from '../../prisma/prisma.service';
import { UserRole } from '@prisma/client';
export declare class InviteService {
    private prisma;
    constructor(prisma: PrismaService);
    createInvite(email: string, fullName: string, phone: string, role: UserRole, createdById: string): Promise<{
        id: string;
        createdAt: Date;
        email: string;
        fullName: string;
        phone: string;
        role: import(".prisma/client").$Enums.UserRole;
        token: string;
        expiresAt: Date;
        usedAt: Date | null;
        createdById: string;
    }>;
    validateInvite(token: string, email: string): Promise<{
        id: string;
        createdAt: Date;
        email: string;
        fullName: string;
        phone: string;
        role: import(".prisma/client").$Enums.UserRole;
        token: string;
        expiresAt: Date;
        usedAt: Date | null;
        createdById: string;
    }>;
    getInviteByToken(token: string): Promise<{
        email: string;
        fullName: string;
        phone: string;
        role: import(".prisma/client").$Enums.UserRole;
        expiresAt: Date;
        usedAt: Date | null;
    }>;
    markInviteAsUsed(token: string): Promise<{
        id: string;
        createdAt: Date;
        email: string;
        fullName: string;
        phone: string;
        role: import(".prisma/client").$Enums.UserRole;
        token: string;
        expiresAt: Date;
        usedAt: Date | null;
        createdById: string;
    }>;
    findPendingInvites(createdById?: string): Promise<{
        id: string;
        createdAt: Date;
        email: string;
        fullName: string;
        phone: string;
        role: import(".prisma/client").$Enums.UserRole;
        token: string;
        expiresAt: Date;
        usedAt: Date | null;
        createdById: string;
    }[]>;
    deleteInvite(id: string, createdById?: string): Promise<{
        id: string;
        createdAt: Date;
        email: string;
        fullName: string;
        phone: string;
        role: import(".prisma/client").$Enums.UserRole;
        token: string;
        expiresAt: Date;
        usedAt: Date | null;
        createdById: string;
    }>;
}
