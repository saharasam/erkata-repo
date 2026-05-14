import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { Request, Response } from 'express'; // Added Request import
import { InviteService } from './invite/invite.service';
import * as bcrypt from 'bcrypt';
import { UserRole, Tier } from '@prisma/client';
import { randomUUID } from 'crypto';
import { NotificationsGateway } from '../notifications/notifications.gateway';

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
    private readonly notificationsGateway: NotificationsGateway,
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
    req?: Request, // Changed any to Request
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

    // Log successful login
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
    };
  }

  async refresh(refreshToken: string) {
    try {
      const payload = this.jwtService.verify<JwtPayload>(refreshToken);

      // Verify user in database to ensure they are still active and get latest roles/tier
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
        throw new UnauthorizedException('User is inactive or no longer exists');
      }

      const newPayload: JwtPayload = {
        sub: profile.id,
        email: profile.email,
        role: profile.role,
        tier: profile.tier,
      };

      const newAccessToken = this.jwtService.sign(newPayload);
      return { accessToken: newAccessToken };
    } catch (err) {
      if (err instanceof UnauthorizedException) throw err;
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
    req?: Request, // Changed any to Request
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

    // 1. Validate invite token if present (Required for administrative roles)
    if (data.inviteToken) {
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
      // Logic for public registration (No token provided)
      // Only allow 'customer' or 'agent' roles for public signups
      if (finalRole !== 'customer' && finalRole !== 'agent') {
        console.warn(
          `[AuthService] Role ${finalRole} is not allowed without an invite. Defaulting to customer.`,
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
        id: randomUUID(),
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
    if (data.inviteToken) {
      const invite = await this.inviteService.markInviteAsUsed(
        data.inviteToken,
      );

      // Notify the inviting admin so their "Pending Invites" list refreshes in real-time
      if (invite && invite.createdById) {
        this.notificationsGateway.sendToUser(
          invite.createdById,
          'notification',
          {
            type: 'invite.claimed',
            inviteId: invite.id,
            message: `The invitation for ${invite.email} has been claimed.`,
          },
        );
      }
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

    // Log successful registration
    void this.prisma.auditLog
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
      .catch((err) =>
        console.error('[AuthService] Failed to log registration:', err),
      );

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
