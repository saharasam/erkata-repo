import { PrismaService } from '../../prisma/prisma.service';
import { UsersService } from '../../users/users.service';
import { UserRole } from '@prisma/client';
export declare class InviteService {
    private prisma;
    private usersService;
    constructor(prisma: PrismaService, usersService: UsersService);
    createInvite(email: string, fullName: string, phone: string, role: UserRole, createdById: string, callerRole: UserRole): Promise<{
        id: string;
        email: string;
        fullName: string;
        phone: string;
        role: import(".prisma/client").$Enums.UserRole;
        createdAt: Date;
        token: string;
        expiresAt: Date;
        usedAt: Date | null;
        createdById: string;
    }>;
    validateInvite(token: string, email: string): Promise<{
        id: string;
        email: string;
        fullName: string;
        phone: string;
        role: import(".prisma/client").$Enums.UserRole;
        createdAt: Date;
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
        email: string;
        fullName: string;
        phone: string;
        role: import(".prisma/client").$Enums.UserRole;
        createdAt: Date;
        token: string;
        expiresAt: Date;
        usedAt: Date | null;
        createdById: string;
    }>;
    findPendingInvites(createdById?: string): Promise<{
        id: string;
        email: string;
        fullName: string;
        phone: string;
        role: import(".prisma/client").$Enums.UserRole;
        createdAt: Date;
        token: string;
        expiresAt: Date;
        usedAt: Date | null;
        createdById: string;
    }[]>;
    deleteInvite(id: string, createdById?: string): Promise<{
        id: string;
        email: string;
        fullName: string;
        phone: string;
        role: import(".prisma/client").$Enums.UserRole;
        createdAt: Date;
        token: string;
        expiresAt: Date;
        usedAt: Date | null;
        createdById: string;
    }>;
}
