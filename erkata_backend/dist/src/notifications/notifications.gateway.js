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
var NotificationsGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const jwt_1 = require("@nestjs/jwt");
const common_1 = require("@nestjs/common");
const redis_presence_service_1 = require("../common/redis/redis-presence.service");
let NotificationsGateway = NotificationsGateway_1 = class NotificationsGateway {
    jwtService;
    presence;
    server;
    logger = new common_1.Logger(NotificationsGateway_1.name);
    userSockets = new Map();
    constructor(jwtService, presence) {
        this.jwtService = jwtService;
        this.presence = presence;
    }
    async handleConnection(client) {
        const auth = client.handshake.auth;
        let token = auth?.token;
        if (token?.startsWith('Bearer ')) {
            token = token.split(' ')[1];
        }
        if (!token) {
            token = client.handshake.query?.token;
        }
        if (!token) {
            this.logger.warn(`Connection rejected: No token provided (Client: ${client.id})`);
            client.disconnect();
            return;
        }
        try {
            const payload = this.jwtService.verify(token, {
                secret: process.env.JWT_SECRET,
            });
            const userId = payload.sub;
            client.data.userId = userId;
            client.data.role = payload.role;
            const existing = this.userSockets.get(userId) || [];
            this.userSockets.set(userId, [...existing, client.id]);
            this.logger.log(`Client connected: ${client.id} (User: ${userId}, Role: ${payload.role})`);
            if (payload.role === 'operator') {
                this.logger.log(`[NotificationsGateway] Operator ${userId} connected via WebSocket. Syncing presence...`);
                await this.presence.heartbeat(userId);
            }
        }
        catch (e) {
            this.logger.error(`Connection authentication failed for client ${client.id}: ${e instanceof Error ? e.message : 'Unknown error'}`);
            client.disconnect();
        }
    }
    handleDisconnect(client) {
        const userId = client.data.userId;
        if (userId) {
            const sockets = this.userSockets.get(userId) || [];
            const updated = sockets.filter((id) => id !== client.id);
            if (updated.length > 0) {
                this.userSockets.set(userId, updated);
            }
            else {
                this.userSockets.delete(userId);
            }
        }
        this.logger.log(`Client disconnected: ${client.id}`);
    }
    sendToUser(userId, event, data) {
        const sockets = this.userSockets.get(userId);
        if (sockets) {
            this.logger.debug(`Sending ${event} to user ${userId} (${sockets.length} sockets)`);
            sockets.forEach((socketId) => {
                this.server.to(socketId).emit(event, data);
            });
        }
    }
    sendToRole(role, event, data) {
        this.server.sockets.sockets.forEach((socket) => {
            if (socket.data.role === role) {
                socket.emit(event, data);
            }
        });
    }
};
exports.NotificationsGateway = NotificationsGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], NotificationsGateway.prototype, "server", void 0);
exports.NotificationsGateway = NotificationsGateway = NotificationsGateway_1 = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: '*',
        },
    }),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        redis_presence_service_1.RedisPresenceService])
], NotificationsGateway);
//# sourceMappingURL=notifications.gateway.js.map