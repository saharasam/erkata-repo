import { Request } from 'express';
import { UserRole } from '@prisma/client';
export interface UserPayload {
    id: string;
    email: string;
    role: UserRole;
    tier: string;
    zoneId?: string;
}
export interface RequestWithUser extends Request {
    user: UserPayload;
}
