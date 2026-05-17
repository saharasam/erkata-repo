"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const prisma_service_1 = require("../prisma/prisma.service");
const invite_service_1 = require("./invite/invite.service");
const bcrypt = __importStar(require("bcrypt"));
const client_1 = require("@prisma/client");
const crypto_1 = require("crypto");
const notifications_gateway_1 = require("../notifications/notifications.gateway");
let AuthService = class AuthService {
    prisma;
    jwtService;
    inviteService;
    notificationsGateway;
    constructor(prisma, jwtService, inviteService, notificationsGateway) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.inviteService = inviteService;
        this.notificationsGateway = notificationsGateway;
    }
    sanitizePhone(phone) {
        if (!phone)
            return '';
        const match = phone.match(/^(?:\+251|251|0)?([79]\d{8})$/);
        if (match) {
            return `+251${match[1]}`;
        }
        const digits = phone.replace(/\D/g, '');
        if (digits.length >= 9) {
            const core = digits.slice(-9);
            if (core.startsWith('9') || core.startsWith('7')) {
                return `+251${core}`;
            }
        }
        return phone.startsWith('+') ? phone : `+${digits}`;
    }
    async login(credentials, res, req) {
        console.log(`[AuthService] Attempting login for email: ${credentials.identifier}`);
        const profile = await this.prisma.profile.findUnique({
            where: { email: credentials.identifier },
        });
        if (!profile || !profile.passwordHash) {
            console.error(`[AuthService] User not found: ${credentials.identifier}`);
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        if (!profile.isActive) {
            throw new common_1.UnauthorizedException('Your account is currently suspended. Please contact an administrator.');
        }
        const passwordsMatch = await bcrypt.compare(credentials.pass, profile.passwordHash);
        if (!passwordsMatch) {
            console.error(`[AuthService] Invalid password for: ${credentials.identifier}`);
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const payload = {
            sub: profile.id,
            email: profile.email,
            role: profile.role,
            tier: profile.tier,
            tokenType: 'access',
        };
        const accessToken = this.jwtService.sign(payload);
        const refreshPayload = {
            ...payload,
            tokenType: 'refresh',
        };
        const refreshToken = this.jwtService.sign(refreshPayload, {
            expiresIn: '7d',
        });
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        const csrfToken = (0, crypto_1.randomUUID)();
        res.cookie('csrfToken', csrfToken, {
            httpOnly: false,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        void this.prisma.auditLog
            .create({
            data: {
                actorId: profile.id,
                action: 'USER_LOGIN',
                targetTable: 'profiles',
                targetId: profile.id,
                metadata: {
                    ip: req?.ip,
                    userAgent: req?.headers?.['user-agent'],
                },
            },
        })
            .catch((err) => console.error('[AuthService] Failed to log login:', err));
        return {
            user: {
                id: profile.id,
                email: profile.email,
                phone: profile.phone,
                fullName: profile.fullName,
                role: profile.role,
                tier: profile.tier,
            },
            accessToken,
            csrfToken,
        };
    }
    async refresh(refreshToken, res) {
        try {
            const payload = this.jwtService.verify(refreshToken);
            if (payload.tokenType !== 'refresh') {
                throw new common_1.UnauthorizedException('Invalid token type');
            }
            const profile = await this.prisma.profile.findUnique({
                where: { id: payload.sub },
                select: {
                    id: true,
                    email: true,
                    role: true,
                    tier: true,
                    isActive: true,
                },
            });
            if (!profile || !profile.isActive) {
                throw new common_1.UnauthorizedException('User is inactive or no longer exists');
            }
            const newPayload = {
                sub: profile.id,
                email: profile.email,
                role: profile.role,
                tier: profile.tier,
                tokenType: 'access',
            };
            const newAccessToken = this.jwtService.sign(newPayload);
            const newCsrfToken = (0, crypto_1.randomUUID)();
            res.cookie('csrfToken', newCsrfToken, {
                httpOnly: false,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                path: '/',
                maxAge: 7 * 24 * 60 * 60 * 1000,
            });
            return { accessToken: newAccessToken, csrfToken: newCsrfToken };
        }
        catch (err) {
            if (err instanceof common_1.UnauthorizedException)
                throw err;
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
    }
    async logout(res) {
        res.clearCookie('refreshToken');
        res.clearCookie('csrfToken');
        await Promise.resolve();
        return { message: 'Logged out' };
    }
    async register(data, res, req) {
        console.log(`[AuthService] Registering user: ${data.fullName}, Email: ${data.email}`);
        const existingUser = await this.prisma.profile.findUnique({
            where: { email: data.email },
        });
        if (existingUser) {
            throw new common_1.ConflictException('User with this email already exists');
        }
        let finalRole = (data.role || 'customer').toLowerCase();
        console.log(`[AuthService] Initial finalRole from data.role: ${data.role}, normalized to: ${finalRole}`);
        return await this.prisma.$transaction(async (tx) => {
            if (data.inviteToken) {
                const updateResult = await tx.invite.updateMany({
                    where: {
                        token: data.inviteToken,
                        usedAt: null,
                        expiresAt: { gt: new Date() },
                    },
                    data: { usedAt: new Date() },
                });
                if (updateResult.count === 0) {
                    throw new common_1.BadRequestException('Token has already been used or is invalid');
                }
                const invite = await tx.invite.findUnique({
                    where: { token: data.inviteToken },
                });
                if (!invite ||
                    invite.email.toLowerCase() !== data.email.toLowerCase()) {
                    throw new common_1.BadRequestException('This invite was intended for a different email address');
                }
                console.log(`[AuthService] Valid invite token provided. Changing role from ${finalRole} to ${invite.role}`);
                finalRole = String(invite.role);
                if (!data.fullName) {
                    data.fullName = invite.fullName;
                }
                if (invite.createdById) {
                    this.notificationsGateway.sendToUser(invite.createdById, 'notification', {
                        type: 'invite.claimed',
                        inviteId: invite.id,
                        message: `The invitation for ${invite.email} has been claimed.`,
                    });
                }
            }
            else {
                console.log(`[AuthService] Handling non-administrative role: ${finalRole}`);
                if (finalRole !== 'customer' && finalRole !== 'agent') {
                    console.warn(`[AuthService] Role ${finalRole} is not allowed without an invite. Defaulting to customer.`);
                    finalRole = 'customer';
                }
            }
            console.log(`[AuthService] Final role determined: ${finalRole}`);
            const saltRoutes = 10;
            const passwordHash = await bcrypt.hash(data.password, saltRoutes);
            let referredById = undefined;
            if (data.referralCode) {
                const lockedReferrers = await tx.$queryRaw `
          SELECT id FROM profiles 
          WHERE referral_code = ${data.referralCode} 
          FOR UPDATE
        `;
                if (!lockedReferrers || lockedReferrers.length === 0) {
                    throw new common_1.BadRequestException('Invalid referral code');
                }
                const referrer = await tx.profile.findUnique({
                    where: { referralCode: data.referralCode },
                    include: { referralLink: true, referrals: { select: { id: true } } },
                });
                if (!referrer) {
                    throw new common_1.BadRequestException('Invalid referral code');
                }
                const tierLimits = {
                    ABUNDANT_LIFE: 31,
                    UNITY: 23,
                    LOVE: 16,
                    PEACE: 7,
                    FREE: 3,
                };
                const referrerWithRefs = referrer;
                const tier = String(referrerWithRefs.referralLink?.tier ?? 'FREE');
                const limit = tierLimits[tier] ?? 3;
                const referralCount = referrerWithRefs.referrals.length;
                if (referralCount >= limit) {
                    throw new common_1.BadRequestException(`The referrer has reached their referral slot limit`);
                }
                referredById = referrer.id;
            }
            const newProfile = await tx.profile.create({
                data: {
                    id: (0, crypto_1.randomUUID)(),
                    email: data.email,
                    passwordHash,
                    fullName: data.fullName,
                    phone: this.sanitizePhone(data.phone),
                    role: finalRole,
                    tier: client_1.Tier.FREE,
                    ...(referredById ? { referredById } : {}),
                },
            });
            console.log(`[AuthService] User created successfully: ${newProfile.id}`);
            const payload = {
                sub: newProfile.id,
                email: newProfile.email,
                role: newProfile.role,
                tier: newProfile.tier,
                tokenType: 'access',
            };
            const accessToken = this.jwtService.sign(payload);
            const refreshPayload = {
                ...payload,
                tokenType: 'refresh',
            };
            const refreshToken = this.jwtService.sign(refreshPayload, {
                expiresIn: '7d',
            });
            const csrfToken = (0, crypto_1.randomUUID)();
            if (res) {
                res.cookie('refreshToken', refreshToken, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'strict',
                    maxAge: 7 * 24 * 60 * 60 * 1000,
                });
                res.cookie('csrfToken', csrfToken, {
                    httpOnly: false,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'strict',
                    path: '/',
                    maxAge: 7 * 24 * 60 * 60 * 1000,
                });
            }
            void tx.auditLog
                .create({
                data: {
                    actorId: newProfile.id,
                    action: 'USER_REGISTER',
                    targetTable: 'profiles',
                    targetId: newProfile.id,
                    metadata: {
                        ip: req?.ip,
                        userAgent: req?.headers?.['user-agent'],
                    },
                },
            })
                .catch((err) => console.error('[AuthService] Failed to log registration:', err));
            return {
                message: 'Registration successful.',
                user: {
                    id: newProfile.id,
                    email: newProfile.email,
                    phone: newProfile.phone,
                    fullName: newProfile.fullName,
                    role: newProfile.role,
                    tier: newProfile.tier,
                },
                accessToken,
                csrfToken,
            };
        });
    }
    async getMe(userId) {
        const profile = await this.prisma.profile.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                phone: true,
                fullName: true,
                role: true,
                tier: true,
                zoneId: true,
            },
        });
        if (!profile) {
            throw new common_1.UnauthorizedException('User not found');
        }
        return profile;
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        invite_service_1.InviteService,
        notifications_gateway_1.NotificationsGateway])
], AuthService);
//# sourceMappingURL=auth.service.js.map