import {
  Controller,
  Post,
  Body,
  Res,
  Req,
  UnauthorizedException,
  InternalServerErrorException,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import type { Response } from 'express';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import type { AuthenticatedRequest } from './guards/authenticated-request.interface';
import { RedisPresenceService } from '../common/redis/redis-presence.service';
import { PrismaService } from '../prisma/prisma.service';
import { UserRole, RequestStatus } from '@prisma/client';

export interface RegisterDto {
  email: string;
  fullName: string;
  phone: string;
  password: string;
  role?: string;
  tier?: string;
  inviteToken?: string;
}

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly presence: RedisPresenceService,
    private readonly prisma: PrismaService,
  ) {}

  @Post('login')
  async login(
    @Body() body: { identifier: string; password: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    return await this.authService.login(
      { identifier: body.identifier, pass: body.password },
      res,
    );
  }

  @Post('refresh')
  async refresh(@Req() req: any) {
    const cookies = (
      req as unknown as {
        cookies?: Record<string, string>;
      }
    ).cookies;
    const refreshToken = cookies?.['refreshToken'];
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token missing');
    }
    return await this.authService.refresh(refreshToken);
  }

  @Post('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    return await this.authService.logout(res);
  }

  @Post('register')
  async register(@Body() body: RegisterDto) {
    try {
      return await this.authService.register(body);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Registration failed';
      throw new InternalServerErrorException(message);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('heartbeat')
  async heartbeat(@Req() req: AuthenticatedRequest) {
    const user = req.user;
    
    // Update Redis Presence
    await this.presence.heartbeat(user.id);

    // If Operator, check for pushed requests
    let assignmentFound = false;
    let requestId: string | null = null;

    if (user.role === UserRole.operator) {
      const pushedRequest = await this.prisma.request.findFirst({
        where: {
          assignedOperatorId: user.id,
          status: RequestStatus.pending,
        } as any,
        select: { id: true },
      });

      if (pushedRequest) {
        assignmentFound = true;
        requestId = pushedRequest.id;
      }
    }

    return {
      status: 'ok',
      assignmentFound,
      requestId,
    };
  }
}
