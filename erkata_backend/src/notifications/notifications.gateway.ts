import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { Logger } from '@nestjs/common';

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

  constructor(private jwtService: JwtService) {}

  async handleConnection(client: Socket) {
    const auth = client.handshake.auth as { token?: string };
    let token = auth?.token;

    if (token?.startsWith('Bearer ')) {
      token = token.split(' ')[1];
    }
    
    if (!token) {
      token = client.handshake.query?.token as string;
    }

    if (!token) {
      this.logger.warn(`Connection rejected: No token provided (Client: ${client.id})`);
      client.disconnect();
      return;
    }

    try {
      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET,
      }) as { sub: string; role: string };

      const userId = payload.sub;
      client.data.userId = userId;
      client.data.role = payload.role;

      const existing = this.userSockets.get(userId) || [];
      this.userSockets.set(userId, [...existing, client.id]);

      this.logger.log(`Client connected: ${client.id} (User: ${userId}, Role: ${payload.role})`);
    } catch (e) {
      this.logger.error(`Connection authentication failed for client ${client.id}: ${e instanceof Error ? e.message : 'Unknown error'}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.data.userId as string;
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
      this.logger.debug(`Sending ${event} to user ${userId} (${sockets.length} sockets)`);
      sockets.forEach((socketId) => {
        this.server.to(socketId).emit(event, data);
      });
    }
  }

  sendToRole(role: string, event: string, data: unknown) {
    this.server.sockets.sockets.forEach((socket) => {
      if (socket.data.role === role) {
        socket.emit(event, data);
      }
    });
  }
}
