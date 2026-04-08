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
let AuthService = class AuthService {
    prisma;
    jwtService;
    inviteService;
    constructor(prisma, jwtService, inviteService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.inviteService = inviteService;
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
        };
        const accessToken = this.jwtService.sign(payload);
        const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
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
        };
    }
    async refresh(refreshToken) {
        try {
            const payload = this.jwtService.verify(refreshToken);
            const newPayload = {
                sub: payload.sub,
                email: payload.email,
                role: payload.role,
                tier: payload.tier,
            };
            const newAccessToken = this.jwtService.sign(newPayload);
            await Promise.resolve();
            return { accessToken: newAccessToken };
        }
        catch {
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
    }
    async logout(res) {
        res.clearCookie('refreshToken');
        await Promise.resolve();
        return { message: 'Logged out' };
    }
    async register(data, res) {
        console.log(`[AuthService] Registering user: ${data.fullName}, Email: ${data.email}`);
        const existingUser = await this.prisma.profile.findUnique({
            where: { email: data.email },
        });
        if (existingUser) {
            throw new common_1.ConflictException('User with this email already exists');
        }
        let finalRole = (data.role || 'customer').toLowerCase();
        console.log(`[AuthService] Initial finalRole from data.role: ${data.role}, normalized to: ${finalRole}`);
        const superAdminEmail = process.env.SUPER_ADMIN_EMAIL;
        if (superAdminEmail &&
            data.email.toLowerCase() === superAdminEmail.toLowerCase()) {
            console.log(`[AuthService] Matching Super Admin email found. Granting super_admin role.`);
            finalRole = 'super_admin';
        }
        else if (data.inviteToken) {
            const invite = await this.inviteService.validateInvite(data.inviteToken, data.email);
            console.log(`[AuthService] Valid invite token provided. Changing role from ${finalRole} to ${invite.role}`);
            finalRole = String(invite.role);
            if (!data.fullName) {
                data.fullName = invite.fullName;
            }
        }
        else {
            console.log(`[AuthService] Handling non-administrative role: ${finalRole}`);
            if (finalRole !== 'customer' && finalRole !== 'agent') {
                console.warn(`[AuthService] Role ${finalRole} is not customer or agent. Defaulting to customer.`);
                finalRole = 'customer';
            }
        }
        console.log(`[AuthService] Final role determined: ${finalRole}`);
        const saltRoutes = 10;
        const passwordHash = await bcrypt.hash(data.password, saltRoutes);
        let referredById = undefined;
        if (data.referralCode) {
            const referrer = await this.prisma.profile.findUnique({
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
        const newProfile = await this.prisma.profile.create({
            data: {
                email: data.email,
                passwordHash,
                fullName: data.fullName,
                phone: this.sanitizePhone(data.phone),
                role: finalRole,
                tier: (data.tier || 'FREE'),
                ...(referredById ? { referredById } : {}),
            },
        });
        if (data.inviteToken &&
            (finalRole === 'admin' || finalRole === 'operator')) {
            await this.inviteService.markInviteAsUsed(data.inviteToken);
        }
        console.log(`[AuthService] User created successfully: ${newProfile.id}`);
        const payload = {
            sub: newProfile.id,
            email: newProfile.email,
            role: newProfile.role,
            tier: newProfile.tier,
        };
        const accessToken = this.jwtService.sign(payload);
        const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });
        if (res) {
            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 7 * 24 * 60 * 60 * 1000,
            });
        }
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