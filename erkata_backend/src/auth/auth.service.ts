import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { Response } from 'express';
import { InviteService } from './invite/invite.service';
import * as bcrypt from 'bcrypt';
import { UserRole, Tier } from '@prisma/client';

interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
  tier: Tier;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly inviteService: InviteService,
  ) {}

  private sanitizePhone(phone: string): string {
    if (!phone) return '';
    let sanitized = phone.replace(/\D/g, '');

    // Ensure it has the 251 prefix if it's an Ethiopian number
    if (sanitized.startsWith('0') && sanitized.length === 10) {
      sanitized = '251' + sanitized.substring(1);
    } else if (sanitized.startsWith('9') && sanitized.length === 9) {
      sanitized = '251' + sanitized;
    } else if (sanitized.startsWith('7') && sanitized.length === 9) {
      sanitized = '251' + sanitized;
    }

    // Expect E.164 format (with +)
    return sanitized.startsWith('+') ? sanitized : `+${sanitized}`;
  }

  async login(
    credentials: { identifier: string; pass: string },
    res: Response,
  ) {
    console.log(
      `[AuthService] Attempting login for email: ${credentials.identifier}`,
    );

    const profile = await this.prisma.profile.findUnique({
      where: { email: credentials.identifier },
    });

    if (!profile || !profile.passwordHash) {
      console.error(`[AuthService] User not found: ${credentials.identifier}`);
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!profile.isActive) {
      throw new UnauthorizedException(
        'Your account is currently suspended. Please contact an administrator.',
      );
    }

    const passwordsMatch = await bcrypt.compare(
      credentials.pass,
      profile.passwordHash,
    );

    if (!passwordsMatch) {
      console.error(
        `[AuthService] Invalid password for: ${credentials.identifier}`,
      );
      throw new UnauthorizedException('Invalid credentials');
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
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
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

  async refresh(refreshToken: string) {
    try {
      const payload = this.jwtService.verify<JwtPayload>(refreshToken);
      const newPayload: JwtPayload = {
        sub: payload.sub,
        email: payload.email,
        role: payload.role,
        tier: payload.tier,
      };
      const newAccessToken = this.jwtService.sign(newPayload);

      await Promise.resolve(); // satisfy async/await requirement
      return { accessToken: newAccessToken };
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(res: Response) {
    res.clearCookie('refreshToken');
    await Promise.resolve();
    return { message: 'Logged out' };
  }

  async register(
    data: {
      email: string;
      fullName: string;
      phone: string;
      password: string;
      role?: string;
      tier?: string;
      inviteToken?: string;
      referralCode?: string;
    },
    res?: Response,
  ) {
    console.log(
      `[AuthService] Registering user: ${data.fullName}, Email: ${data.email}`,
    );

    const existingUser = await this.prisma.profile.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    let finalRole = (data.role || 'customer').toLowerCase();
    console.log(
      `[AuthService] Initial finalRole from data.role: ${data.role}, normalized to: ${finalRole}`,
    );

    // 1. Check if this is the Super Admin from ENV
    const superAdminEmail = process.env.SUPER_ADMIN_EMAIL;
    if (
      superAdminEmail &&
      data.email.toLowerCase() === superAdminEmail.toLowerCase()
    ) {
      console.log(
        `[AuthService] Matching Super Admin email found. Granting super_admin role.`,
      );
      finalRole = 'super_admin';
    }
    // 2. Validate invite token if present
    else if (data.inviteToken) {
      const invite = await this.inviteService.validateInvite(
        data.inviteToken,
        data.email,
      );

      console.log(
        `[AuthService] Valid invite token provided. Changing role from ${finalRole} to ${invite.role}`,
      );

      finalRole = String(invite.role);
      if (!data.fullName) {
        data.fullName = invite.fullName;
      }
    } else {
      console.log(
        `[AuthService] Handling non-administrative role: ${finalRole}`,
      );
      if (finalRole !== 'customer' && finalRole !== 'agent') {
        console.warn(
          `[AuthService] Role ${finalRole} is not customer or agent. Defaulting to customer.`,
        );
        finalRole = 'customer';
      }
    }
    console.log(`[AuthService] Final role determined: ${finalRole}`);

    const saltRoutes = 10;
    const passwordHash = await bcrypt.hash(data.password, saltRoutes);

    // Resolve referrer if a referral code was provided
    let referredById: string | undefined = undefined;
    if (data.referralCode) {
      const referrer = await this.prisma.profile.findUnique({
        where: { referralCode: data.referralCode },
        include: { referralLink: true, referrals: { select: { id: true } } },
      });
      if (!referrer) {
        throw new BadRequestException('Invalid referral code');
      }
      // Check that the referrer has available slots
      const tierLimits: Record<string, number> = {
        ABUNDANT_LIFE: 31,
        UNITY: 23,
        LOVE: 16,
        PEACE: 7,
        FREE: 3,
      };
      const referrerWithRefs = referrer as typeof referrer & {
        referralLink: { tier: string } | null;
        referrals: { id: string }[];
      };
      const tier = String(referrerWithRefs.referralLink?.tier ?? 'FREE');
      const limit = tierLimits[tier] ?? 3;
      const referralCount = referrerWithRefs.referrals.length;
      if (referralCount >= limit) {
        throw new BadRequestException(
          `The referrer has reached their referral slot limit`,
        );
      }
      referredById = referrer.id;
    }

    const newProfile = await this.prisma.profile.create({
      data: {
        email: data.email,
        passwordHash,
        fullName: data.fullName,
        phone: this.sanitizePhone(data.phone),
        role: finalRole as UserRole,
        tier: (data.tier || 'FREE') as Tier,
        ...(referredById ? { referredById } : {}),
      },
    });

    // Mark invite as used if applicable
    if (
      data.inviteToken &&
      (finalRole === 'admin' || finalRole === 'operator')
    ) {
      await this.inviteService.markInviteAsUsed(data.inviteToken);
    }

    console.log(`[AuthService] User created successfully: ${newProfile.id}`);

    // AUTOMATIC LOGIN LOGIC
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
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
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
}
