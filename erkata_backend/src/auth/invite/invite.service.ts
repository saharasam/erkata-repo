import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UserRole } from '@prisma/client';
import { randomBytes } from 'crypto';

@Injectable()
export class InviteService {
  constructor(private prisma: PrismaService) {}

  async createInvite(email: string, role: UserRole, createdById: string) {
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 48); // 48 hour expiry

    return (this.prisma as any).invite.create({
      data: {
        email,
        role,
        token,
        expiresAt,
        createdById,
      },
    });
  }

  async validateInvite(token: string, email: string) {
    const invite = await (this.prisma as any).invite.findUnique({
      where: { token },
    });

    if (!invite) {
      throw new NotFoundException('Invalid invite token');
    }

    if (invite.usedAt) {
      throw new BadRequestException('Invite token has already been used');
    }

    if (invite.expiresAt < new Date()) {
      throw new BadRequestException('Invite token has expired');
    }

    if (invite.email.toLowerCase() !== email.toLowerCase()) {
      throw new BadRequestException('This invite was intended for a different email address');
    }

    return invite;
  }

  async markInviteAsUsed(token: string) {
    return (this.prisma as any).invite.update({
      where: { token },
      data: { usedAt: new Date() },
    });
  }
}
