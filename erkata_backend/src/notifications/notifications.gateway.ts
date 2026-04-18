import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket as BaseSocket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { Logger } from '@nestjs/common';
import { RedisPresenceService } from '../common/redis/redis-presence.service';

interface SocketData {
  userId: string;
  role: string;
}

type AuthenticatedSocket = BaseSocket<any, any, any, SocketData>;

@WebSocketGateway({
  cors: {
    origin: '*', // Adjust for production
  },
})
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationsGateway.name);
  private userSockets = new Map<string, string[]>();

  constructor(
    private jwtService: JwtService,
    private readonly presence: RedisPresenceService,
  ) {}

  async handleConnection(client: AuthenticatedSocket) {
    const auth = client.handshake.auth as { token?: string };
    let token = auth?.token;

    if (token?.startsWith('Bearer ')) {
      token = token.split(' ')[1];
    }

    if (!token) {
      token = client.handshake.query?.token as string;
    }

    if (!token) {
      this.logger.warn(
        `Connection rejected: No token provided (Client: ${client.id})`,
      );
      client.disconnect();
      return;
    }

    try {
      const payload: { sub: string; role: string } = this.jwtService.verify(
        token,
        {
          secret: process.env.JWT_SECRET,
        },
      );

      const userId = payload.sub;
      client.data.userId = userId;
      client.data.role = payload.role;

      const existing = this.userSockets.get(userId) || [];
      this.userSockets.set(userId, [...existing, client.id]);

      this.logger.log(
        `Client connected: ${client.id} (User: ${userId}, Role: ${payload.role})`,
      );

      // Immediately sync operator presence so they're visible to the assignment engine
      if (payload.role === 'operator') {
        this.logger.log(
          `[NotificationsGateway] Operator ${userId} connected via WebSocket. Syncing presence...`,
        );
        await this.presence.heartbeat(userId);
      }
    } catch (e) {
      this.logger.error(
        `Connection authentication failed for client ${client.id}: ${e instanceof Error ? e.message : 'Unknown error'}`,
      );
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    const userId = client.data.userId;
    if (userId) {
      const sockets = this.userSockets.get(userId) || [];
      const updated = sockets.filter((id) => id !== client.id);
      if (updated.length > 0) {
        this.userSockets.set(userId, updated);
      } else {
        this.userSockets.delete(userId);
      }
    }
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  sendToUser(userId: string, event: string, data: unknown) {
    const sockets = this.userSockets.get(userId);
    if (sockets) {
      this.logger.debug(
        `Sending ${event} to user ${userId} (${sockets.length} sockets)`,
      );
      sockets.forEach((socketId) => {
        this.server.to(socketId).emit(event, data);
      });
    }
  }

  sendToRole(role: string, event: string, data: unknown) {
    this.server.sockets.sockets.forEach(
      (socket: BaseSocket<any, any, any, SocketData>) => {
        if (socket.data.role === role) {
          socket.emit(event, data);
        }
      },
    );
  }
}
