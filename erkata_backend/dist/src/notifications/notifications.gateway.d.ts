import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket as BaseSocket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { RedisPresenceService } from '../common/redis/redis-presence.service';
interface SocketData {
    userId: string;
    role: string;
}
type AuthenticatedSocket = BaseSocket<any, any, any, SocketData>;
export declare class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private jwtService;
    private readonly presence;
    server: Server;
    private readonly logger;
    private userSockets;
    constructor(jwtService: JwtService, presence: RedisPresenceService);
    handleConnection(client: AuthenticatedSocket): Promise<void>;
    handleDisconnect(client: AuthenticatedSocket): void;
    sendToUser(userId: string, event: string, data: unknown): void;
    sendToRole(role: string, event: string, data: unknown): void;
}
export {};
