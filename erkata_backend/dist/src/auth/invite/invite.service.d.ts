import { PrismaService } from '../../prisma/prisma.service';
import { UserRole } from '@prisma/client';
export declare class InviteService {
    private prisma;
    constructor(prisma: PrismaService);
    createInvite(email: string, role: UserRole, createdById: string): Promise<any>;
    validateInvite(token: string, email: string): Promise<any>;
    markInviteAsUsed(token: string): Promise<any>;
}
