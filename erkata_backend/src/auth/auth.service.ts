import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
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
  tokenType: 'access' | 'refresh';
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

    // Regex to match Ethiopian mobile numbers and extract the core 9 digits
    const match = phone.match(/^(?:\+251|251|0)?([79]\d{8})$/);
    if (match) {
      // Group 1 contains the 9 digits starting with 7 or 9
      return `+251${match[1]}`;
    }

    // Fallback: If regex doesn't match (e.g., bypass or invalid internal data),
    // try to extract the last 9 digits if they look like an Ethiopian mobile number.
    const digits = phone.replace(/\D/g, '');
    if (digits.length >= 9) {
      const core = digits.slice(-9);
      if (core.startsWith('9') || core.startsWith('7')) {
        return `+251${core}`;
      }
    }

    // Last resort fallback (non-Ethiopian or completely invalid)
    return phone.startsWith('+') ? phone : `+${digits}`;
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

    const payload: JwtPayload = {
      sub: profile.id,
      email: profile.email,
      role: profile.role,
      tier: profile.tier,
      tokenType: 'access',
    };
    const accessToken = this.jwtService.sign(payload);

    const refreshPayload: JwtPayload = {
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
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    const csrfToken = randomUUID();
    res.cookie('csrfToken', csrfToken, {
      httpOnly: false, // Must be accessible by JS
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
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
      csrfToken,
    };
  }

  async refresh(refreshToken: string, res: Response) {
    try {
      const payload = this.jwtService.verify<JwtPayload>(refreshToken);

      if (payload.tokenType !== 'refresh') {
        throw new UnauthorizedException('Invalid token type');
      }

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
        tokenType: 'access',
      };

      const newAccessToken = this.jwtService.sign(newPayload);

      // Rotate CSRF token
      const newCsrfToken = randomUUID();
      res.cookie('csrfToken', newCsrfToken, {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return { accessToken: newAccessToken, csrfToken: newCsrfToken };
    } catch (err) {
      if (err instanceof UnauthorizedException) throw err;
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(res: Response) {
    res.clearCookie('refreshToken');
    res.clearCookie('csrfToken');
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

    return await this.prisma.$transaction(async (tx) => {
      // 1. Validate invite token if present (Required for administrative roles)
      if (data.inviteToken) {
        // Atomic Check-and-Update to prevent race conditions (TOCTOU)
        const updateResult = await tx.invite.updateMany({
          where: {
            token: data.inviteToken,
            usedAt: null,
            expiresAt: { gt: new Date() },
          },
          data: { usedAt: new Date() },
        });

        if (updateResult.count === 0) {
          throw new BadRequestException(
            'Token has already been used or is invalid',
          );
        }

        // Fetch the invite details after marking it as used
        const invite = await tx.invite.findUnique({
          where: { token: data.inviteToken },
        });

        if (
          !invite ||
          invite.email.toLowerCase() !== data.email.toLowerCase()
        ) {
          throw new BadRequestException(
            'This invite was intended for a different email address',
          );
        }

        console.log(
          `[AuthService] Valid invite token provided. Changing role from ${finalRole} to ${invite.role}`,
        );

        finalRole = String(invite.role);
        if (!data.fullName) {
          data.fullName = invite.fullName;
        }

        // Notify the inviting admin (Real-time)
        if (invite.createdById) {
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
        // ERK-SEC-004 Remediation: Use pessimistic locking to prevent referral slot bypass (TOCTOU)
        // We must lock the referrer row before checking their current referral count
        const lockedReferrers = await tx.$queryRaw<any[]>`
          SELECT id FROM profiles 
          WHERE referral_code = ${data.referralCode} 
          FOR UPDATE
        `;

        if (!lockedReferrers || lockedReferrers.length === 0) {
          throw new BadRequestException('Invalid referral code');
        }

        const referrer = await tx.profile.findUnique({
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

      const newProfile = await tx.profile.create({
        data: {
          id: randomUUID(),
          email: data.email,
          passwordHash,
          fullName: data.fullName,
          phone: this.sanitizePhone(data.phone),
          role: finalRole as UserRole,
          tier: Tier.FREE, // ERK-001 Remediation: Hardcoded to FREE for public signups
          ...(referredById ? { referredById } : {}),
        },
      });

      console.log(`[AuthService] User created successfully: ${newProfile.id}`);

      // AUTOMATIC LOGIN LOGIC
      const payload: JwtPayload = {
        sub: newProfile.id,
        email: newProfile.email,
        role: newProfile.role,
        tier: newProfile.tier,
        tokenType: 'access',
      };
      const accessToken = this.jwtService.sign(payload);

      const refreshPayload: JwtPayload = {
        ...payload,
        tokenType: 'refresh',
      };
      const refreshToken = this.jwtService.sign(refreshPayload, {
        expiresIn: '7d',
      });

      const csrfToken = randomUUID();
      if (res) {
        res.cookie('refreshToken', refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        res.cookie('csrfToken', csrfToken, {
          httpOnly: false,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          path: '/',
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });
      }

      // Log successful registration
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
        csrfToken,
      };
    });
  }

  async getMe(userId: string) {
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
      throw new UnauthorizedException('User not found');
    }

    return profile;
  }
}
