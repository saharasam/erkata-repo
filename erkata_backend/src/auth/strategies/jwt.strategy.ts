import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      throw new Error('JWT_SECRET is missing in environment variables');
    }

    console.log('[JwtStrategy] Initializing JWT strategy with custom secret');

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  validate(payload: {
    sub: string;
    email: string;
    role?: string;
    tier?: string;
  }) {
    const userId = payload.sub;

    if (!userId) {
      console.error(
        '[JwtStrategy] Validation failed: sub (userId) missing in payload',
      );
      throw new UnauthorizedException('Invalid token: sub missing');
    }

    console.log(
      `[JwtStrategy] Validated token for user: ${payload.email}, Role: ${payload.role || 'customer'}`,
    );

    return {
      id: userId,
      email: payload.email,
      role: payload.role || 'customer',
      tier: payload.tier || 'FREE',
    };
  }
}
