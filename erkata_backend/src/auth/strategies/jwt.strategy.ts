import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly prisma: PrismaService) {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET is missing in environment variables');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: {
    sub: string;
    email: string;
    role?: string;
    tier?: string;
  }) {
    const userId = payload.sub;

    if (!userId) {
      throw new UnauthorizedException('Invalid token: sub missing');
    }

    // ENFORCEMENT: Check if the user is active in the database.
    // NOTE: This adds a DB lookup per request to ensure instant suspension.
    // If performance dips under high load, consider implementing Redis caching for this check.
    const profile = await this.prisma.profile.findUnique({
      where: { id: userId },
      select: { isActive: true, role: true, tier: true, email: true },
    });

    if (!profile) {
      throw new UnauthorizedException('User profile no longer exists');
    }

    if (!profile.isActive) {
      throw new UnauthorizedException(
        'Your account has been suspended. Please contact administration.',
      );
    }

    return {
      id: userId,
      email: profile.email,
      role: profile.role,
      tier: profile.tier,
    };
  }
}
