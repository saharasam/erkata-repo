import { PrismaService } from '../prisma/prisma.service';
import { PaginationDto } from '../common/dto/pagination.dto';
export declare class AuditLogsController {
    private prisma;
    constructor(prisma: PrismaService);
    getAuditLogs(query: PaginationDto, action?: string): Promise<{
        entityType: string | null;
        entityId: string | null;
        actor: {
            fullName: string;
            role: import(".prisma/client").$Enums.UserRole;
        } | null;
        id: string;
        createdAt: Date;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        action: string;
        targetTable: string | null;
        targetId: string | null;
        transactionId: string | null;
        actorId: string | null;
    }[]>;
}
