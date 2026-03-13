"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const prisma_service_1 = require("../prisma/prisma.service");
const supabase_js_1 = require("@supabase/supabase-js");
const invite_service_1 = require("./invite/invite.service");
let AuthService = class AuthService {
    prisma;
    jwtService;
    inviteService;
    supabaseAdmin;
    constructor(prisma, jwtService, inviteService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.inviteService = inviteService;
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (!supabaseUrl || !supabaseKey) {
            throw new Error('Supabase URL and Service Role Key are required');
        }
        this.supabaseAdmin = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
        });
    }
    sanitizePhone(phone) {
        if (!phone)
            return '';
        let sanitized = phone.replace(/\D/g, '');
        if (sanitized.startsWith('0') && sanitized.length === 10) {
            sanitized = '251' + sanitized.substring(1);
        }
        else if (sanitized.startsWith('9') && sanitized.length === 9) {
            sanitized = '251' + sanitized;
        }
        else if (sanitized.startsWith('7') && sanitized.length === 9) {
            sanitized = '251' + sanitized;
        }
        return sanitized.startsWith('+') ? sanitized : `+${sanitized}`;
    }
    async login(credentials, res) {
        console.log(`[AuthService] Attempting login for email: ${credentials.identifier}`);
        const { data, error } = await this.supabaseAdmin.auth.signInWithPassword({
            email: credentials.identifier,
            password: credentials.pass,
        });
        if (error || !data.user) {
            console.error(`[AuthService] Supabase login failed for ${credentials.identifier}:`, error?.message);
            throw new common_1.UnauthorizedException(error?.message || 'Invalid credentials');
        }
        const profile = await this.prisma.profile.findUnique({
            where: { id: data.user.id },
        });
        if (data.session?.refresh_token) {
            res.cookie('refreshToken', data.session.refresh_token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 7 * 24 * 60 * 60 * 1000,
            });
        }
        return {
            user: {
                id: data.user.id,
                email: data.user.email,
                phone: profile?.phone,
                fullName: profile?.fullName,
                role: data.user.app_metadata?.role || profile?.role,
                tier: data.user.app_metadata?.tier || profile?.tier,
            },
            accessToken: data.session?.access_token,
        };
    }
    async refresh(refreshToken) {
        const { data, error } = await this.supabaseAdmin.auth.refreshSession({
            refresh_token: refreshToken,
        });
        if (error || !data.session) {
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
        return { accessToken: data.session.access_token };
    }
    async logout(res) {
        res.clearCookie('refreshToken');
        await Promise.resolve();
        return { message: 'Logged out' };
    }
    async register(data) {
        console.log(`[AuthService] Registering user: ${data.fullName}, Email: ${data.email}`);
        let finalRole = data.role || 'customer';
        const superAdminEmail = process.env.SUPER_ADMIN_EMAIL;
        if (superAdminEmail && data.email.toLowerCase() === superAdminEmail.toLowerCase()) {
            console.log(`[AuthService] Matching Super Admin email found. Granting super_admin role.`);
            finalRole = 'super_admin';
        }
        else if (finalRole === 'admin' || finalRole === 'operator') {
            if (!data.inviteToken) {
                console.warn(`[AuthService] Registration attempt as ${finalRole} without token. Defaulting to customer.`);
                finalRole = 'customer';
            }
            else {
                await this.inviteService.validateInvite(data.inviteToken, data.email);
                console.log(`[AuthService] Valid invite token for ${finalRole} provided.`);
            }
        }
        else {
            if (finalRole !== 'customer' && finalRole !== 'agent') {
                finalRole = 'customer';
            }
        }
        const { data: authData, error } = await this.supabaseAdmin.auth.signUp({
            email: data.email,
            password: data.password,
            options: {
                data: {
                    full_name: data.fullName,
                },
            },
        });
        if (error) {
            console.error(`[AuthService] Registration failed for ${data.email}:`, error);
            throw new common_1.InternalServerErrorException(error.message);
        }
        if (!authData.user) {
            throw new common_1.InternalServerErrorException('User creation failed');
        }
        await this.supabaseAdmin.auth.admin.updateUserById(authData.user.id, {
            app_metadata: {
                role: finalRole,
                tier: data.tier || 'FREE',
            },
        });
        await this.prisma.profile.upsert({
            where: { id: authData.user.id },
            update: {
                role: finalRole,
                fullName: data.fullName,
            },
            create: {
                id: authData.user.id,
                fullName: data.fullName,
                phone: '',
                role: finalRole,
            },
        });
        if (data.inviteToken && (finalRole === 'admin' || finalRole === 'operator')) {
            await this.inviteService.markInviteAsUsed(data.inviteToken);
        }
        console.log(`[AuthService] User created successfully: ${authData.user.id}`);
        return {
            message: 'Registration successful. Please verify your email if required.',
            userId: authData.user.id,
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        invite_service_1.InviteService])
], AuthService);
//# sourceMappingURL=auth.service.js.map