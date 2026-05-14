import { UserRole, Tier } from '@prisma/client';
export declare class RegisterDto {
    email: string;
    fullName: string;
    phone: string;
    password: string;
    role?: UserRole;
    tier?: Tier;
    inviteToken?: string;
}
