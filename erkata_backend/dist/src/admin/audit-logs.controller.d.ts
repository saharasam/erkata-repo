import { PrismaService } from '../prisma/prisma.service';
export declare class AuditLogsController {
    private prisma;
    constructor(prisma: PrismaService);
    getAuditLogs(limit?: number, offset?: number, action?: string): Promise<{
        entityType: string | null;
        entityId: string | null;
        actor: {
            role: import(".prisma/client").$Enums.UserRole;
            fullName: string;
        } | null;
        id: string;
        action: string;
        createdAt: Date;
        actorId: string | null;
        targetTable: string | null;
        targetId: string | null;
        transactionId: string | null;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
    }[]>;
}
