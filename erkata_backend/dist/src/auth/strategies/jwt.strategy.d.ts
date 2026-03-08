import { Strategy } from 'passport-jwt';
declare const JwtStrategy_base: new (...args: [opt: import("passport-jwt").StrategyOptionsWithRequest] | [opt: import("passport-jwt").StrategyOptionsWithoutRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class JwtStrategy extends JwtStrategy_base {
    constructor();
    validate(payload: {
        sub: string;
        email: string;
        app_metadata?: {
            role?: string;
            tier?: string;
            zone_id?: string;
        };
    }): {
        id: string;
        email: string;
        role: string;
        tier: string;
        zoneId: string | undefined;
    };
}
export {};
