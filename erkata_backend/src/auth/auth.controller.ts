import {
  Controller,
  Post,
  Body,
  Res,
  Req,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import type { Response, Request } from 'express';

export interface RegisterDto {
  email: string;
  fullName: string;
  password: string;
  role?: string;
  tier?: string;
  inviteToken?: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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
  async refresh(@Req() req: Request) {
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
}
