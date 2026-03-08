"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtStrategy = void 0;
const passport_jwt_1 = require("passport-jwt");
const passport_1 = require("@nestjs/passport");
const common_1 = require("@nestjs/common");
let JwtStrategy = class JwtStrategy extends (0, passport_1.PassportStrategy)(passport_jwt_1.Strategy) {
    constructor() {
        const supabaseUrl = process.env.SUPABASE_URL;
        if (!supabaseUrl) {
            throw new Error('SUPABASE_URL is missing in environment variables');
        }
        const jwksUri = `${supabaseUrl}/auth/v1/.well-known/jwks.json`;
        console.log(`[JwtStrategy] Initializing JWKS strategy with URI: ${jwksUri}`);
        super({
            jwtFromRequest: passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken(),
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
    validate(payload) {
        const role = payload.app_metadata?.role;
        const tier = payload.app_metadata?.tier;
        const userId = payload.sub;
        if (!userId) {
            console.error('[JwtStrategy] Validation failed: sub (userId) missing in payload');
            throw new common_1.UnauthorizedException('Invalid token: sub missing');
        }
        console.log(`[JwtStrategy] Validated token for user: ${payload.email}, Role: ${role || 'customer'}`);
        return {
            id: userId,
            email: payload.email,
            role: role || 'customer',
            tier: tier || 'FREE',
            zoneId: payload.app_metadata?.zone_id,
        };
    }
};
exports.JwtStrategy = JwtStrategy;
exports.JwtStrategy = JwtStrategy = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], JwtStrategy);
//# sourceMappingURL=jwt.strategy.js.map