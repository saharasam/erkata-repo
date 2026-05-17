import {
  Controller,
  Get,
  Post,
  Body,
  Res,
  Req,
  Header,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import type { Response, Request } from 'express';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import type { AuthenticatedRequest } from './guards/authenticated-request.interface';
import { RedisPresenceService } from '../common/redis/redis-presence.service';
import { PrismaService } from '../prisma/prisma.service';
import { UserRole, RequestStatus } from '@prisma/client';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly presence: RedisPresenceService,
    private readonly prisma: PrismaService,
  ) {}

  @Post('login')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  async login(
    @Body() body: { identifier: string; password: string },
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request,
  ) {
    return await this.authService.login(
      { identifier: body.identifier, pass: body.password },
      res,
      req,
    );
  }

  @Post('refresh')
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { cookies } = req as Request & {
      cookies?: { refreshToken?: string };
    };
    const refreshToken = cookies?.refreshToken;

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token missing');
    }

    return await this.authService.refresh(refreshToken, res);
  }

  @Post('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    return await this.authService.logout(res);
  }

  @Post('register')
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  async register(
    @Body() body: RegisterDto,
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request,
  ) {
    return await this.authService.register(body, res, req);
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
        },
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
  @Get('me')
  @UseGuards(JwtAuthGuard)
  @Header(
    'Cache-Control',
    'no-store, no-cache, must-revalidate, proxy-revalidate',
  )
  async getMe(@Req() req: AuthenticatedRequest) {
    const user = req.user;
    return await this.authService.getMe(user.id);
  }
}
