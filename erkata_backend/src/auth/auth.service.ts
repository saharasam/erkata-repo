import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Response } from 'express';
import { InviteService } from './invite/invite.service';

// Roles and Tiers are handled as strings to avoid @prisma/client export issues
@Injectable()
export class AuthService {
  private supabaseAdmin: SupabaseClient;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly inviteService: InviteService,
  ) {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase URL and Service Role Key are required');
    }

    this.supabaseAdmin = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }) as unknown as SupabaseClient;
  }

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

    // Supabase expects E.164 format (with +)
    return sanitized.startsWith('+') ? sanitized : `+${sanitized}`;
  }

  async login(
    credentials: { identifier: string; pass: string },
    res: Response,
  ) {
    console.log(
      `[AuthService] Attempting login for email: ${credentials.identifier}`,
    );

    const { data, error } = await this.supabaseAdmin.auth.signInWithPassword({
      email: credentials.identifier,
      password: credentials.pass,
    });

    if (error || !data.user) {
      console.error(
        `[AuthService] Supabase login failed for ${credentials.identifier}:`,
        error?.message,
      );
      throw new UnauthorizedException(error?.message || 'Invalid credentials');
    }

    const profile = await this.prisma.profile.findUnique({
      where: { id: data.user.id },
    });

    // Refresh Token in httpOnly cookie
    if (data.session?.refresh_token) {
      res.cookie('refreshToken', data.session.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
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

  async refresh(refreshToken: string) {
    const { data, error } = await this.supabaseAdmin.auth.refreshSession({
      refresh_token: refreshToken,
    });

    if (error || !data.session) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    return { accessToken: data.session.access_token };
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

    let finalRole = data.role || 'customer';

    // 1. Check if this is the Super Admin from ENV
    const superAdminEmail = process.env.SUPER_ADMIN_EMAIL;
    if (superAdminEmail && data.email.toLowerCase() === superAdminEmail.toLowerCase()) {
      console.log(`[AuthService] Matching Super Admin email found. Granting super_admin role.`);
      finalRole = 'super_admin';
    } 
    // 2. Validate invite token for restricted roles
    else if (finalRole === 'admin' || finalRole === 'operator') {
      if (!data.inviteToken) {
        console.warn(`[AuthService] Registration attempt as ${finalRole} without token. Defaulting to customer.`);
        finalRole = 'customer';
      } else {
        // InviteService will throw if invalid/expired/wrong email
        await this.inviteService.validateInvite(data.inviteToken, data.email);
        console.log(`[AuthService] Valid invite token for ${finalRole} provided.`);
      }
    } else {
      // Any other role attempt (like trying to register as super_admin manually) defaults to customer
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
      console.error(
        `[AuthService] Registration failed for ${data.email}:`,
        error,
      );
      throw new InternalServerErrorException(error.message);
    }

    if (!authData.user) {
      throw new InternalServerErrorException('User creation failed');
    }

    // Update app_metadata via Admin API
    await this.supabaseAdmin.auth.admin.updateUserById(authData.user.id, {
      app_metadata: {
        role: finalRole,
        tier: data.tier || 'FREE',
      },
    });

    // Manual profile creation
    await this.prisma.profile.upsert({
      where: { id: authData.user.id },
      update: {
        role: finalRole as any,
        fullName: data.fullName,
      },
      create: {
        id: authData.user.id,
        fullName: data.fullName,
        phone: '', // No longer collected on signup
        role: finalRole as any,
      },
    });

    // Mark invite as used if applicable
    if (data.inviteToken && (finalRole === 'admin' || finalRole === 'operator')) {
      await this.inviteService.markInviteAsUsed(data.inviteToken);
    }

    console.log(`[AuthService] User created successfully: ${authData.user.id}`);
    return {
      message: 'Registration successful. Please verify your email if required.',
      userId: authData.user.id,
    };
  }
}
