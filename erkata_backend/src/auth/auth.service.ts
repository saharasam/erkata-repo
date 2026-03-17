import {
  Injectable,
  UnauthorizedException,
  ConflictException,
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

  async register(data: {
    email: string;
    fullName: string;
    password: string;
    role?: string;
    tier?: string;
    inviteToken?: string;
  }) {
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
    // 2. Validate invite token for admin role
    else if (finalRole === 'admin') {
      if (!data.inviteToken) {
        console.warn(
          `[AuthService] Registration attempt as admin without token. Defaulting to customer.`,
        );
        finalRole = 'customer';
      } else {
        await this.inviteService.validateInvite(data.inviteToken, data.email);
        console.log(`[AuthService] Valid invite token for admin provided.`);
      }
    } else {
      console.log(`[AuthService] Handling non-admin role: ${finalRole}`);
      if (
        finalRole !== 'customer' &&
        finalRole !== 'agent' &&
        finalRole !== 'operator'
      ) {
        console.warn(
          `[AuthService] Role ${finalRole} is not customer/agent/operator. Defaulting to customer.`,
        );
        finalRole = 'customer';
      }
    }
    console.log(`[AuthService] Final role determined: ${finalRole}`);

    const saltRoutes = 10;
    const passwordHash = await bcrypt.hash(data.password, saltRoutes);

    const newProfile = await this.prisma.profile.create({
      data: {
        email: data.email,
        passwordHash,
        fullName: data.fullName,
        phone: '',
        role: finalRole as UserRole,
        tier: (data.tier || 'FREE') as Tier,
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
    return {
      message: 'Registration successful.',
      userId: newProfile.id,
      debugRole: finalRole,
    };
  }
}
