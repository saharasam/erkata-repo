import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    if (!supabaseUrl) {
      throw new Error('SUPABASE_URL is missing in environment variables');
    }

    const jwksUri = `${supabaseUrl}/auth/v1/.well-known/jwks.json`;

    console.log(
      `[JwtStrategy] Initializing JWKS strategy with URI: ${jwksUri}`,
    );

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      algorithms: ['ES256', 'HS256', 'RS256'],
      secretOrKeyProvider: require('jwks-rsa').passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: jwksUri,
      }),
    });
  }

  validate(payload: {
    sub: string;
    email: string;
    app_metadata?: { role?: string; tier?: string; zone_id?: string };
  }) {
    // Supabase specific claims are in app_metadata
    const role = payload.app_metadata?.role;
    const tier = payload.app_metadata?.tier;
    const userId = payload.sub;

    if (!userId) {
      console.error(
        '[JwtStrategy] Validation failed: sub (userId) missing in payload',
      );
      throw new UnauthorizedException('Invalid token: sub missing');
    }

    console.log(
      `[JwtStrategy] Validated token for user: ${payload.email}, Role: ${role || 'customer'}`,
    );

    return {
      id: userId, // Changed from userId to id to match controller expectations
      email: payload.email,
      role: role || 'customer',
      tier: tier || 'FREE',
      zoneId: payload.app_metadata?.zone_id,
    };
  }
}
