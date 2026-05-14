import { UserRole } from '@prisma/client';
export declare class InviteDto {
    email: string;
    fullName: string;
    phone: string;
    role: UserRole;
}
