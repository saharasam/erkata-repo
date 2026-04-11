import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UsersService } from '../../users/users.service';
import { UserRole } from '@prisma/client';
import { randomBytes } from 'crypto';

@Injectable()
export class InviteService {
  constructor(
    private prisma: PrismaService,
    private usersService: UsersService,
  ) {}

  async createInvite(
    email: string,
    fullName: string,
    phone: string,
    role: UserRole,
    createdById: string,
    callerRole: UserRole,
  ) {
    // ENFORCEMENT: Hierarchy Authority Check
    if (!this.usersService.canModifyUser(callerRole, role)) {
      throw new ForbiddenException(
        `Your role (${callerRole}) is not authorized to invite a ${role}`,
      );
    }

    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 72); // 72 hour expiry (3 days)

    return await this.prisma.invite.create({
      data: {
        email,
        fullName,
        phone,
        role,
        token,
        expiresAt,
        createdById,
      },
    });
  }

  async validateInvite(token: string, email: string) {
    const invite = await this.prisma.invite.findUnique({
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
      throw new BadRequestException(
        'This invite was intended for a different email address',
      );
    }

    return invite;
  }

  async getInviteByToken(token: string) {
    const invite = await this.prisma.invite.findUnique({
      where: { token },
      select: {
        email: true,
        fullName: true,
        phone: true,
        role: true,
        expiresAt: true,
        usedAt: true,
      },
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

    return invite;
  }

  async markInviteAsUsed(token: string) {
    return await this.prisma.invite.update({
      where: { token },
      data: { usedAt: new Date() },
    });
  }

  async findPendingInvites(createdById?: string) {
    return await this.prisma.invite.findMany({
      where: {
        usedAt: null,
        expiresAt: { gt: new Date() },
        ...(createdById ? { createdById } : {}),
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async deleteInvite(id: string, createdById?: string) {
    const invite = await this.prisma.invite.findUnique({
      where: { id },
    });

    if (!invite) throw new NotFoundException('Invite not found');

    if (createdById && invite.createdById !== createdById) {
      throw new BadRequestException('You can only cancel your own invites');
    }

    if (invite.usedAt) {
      throw new BadRequestException('Cannot cancel an already used invite');
    }

    return await this.prisma.invite.delete({
      where: { id },
    });
  }
}
