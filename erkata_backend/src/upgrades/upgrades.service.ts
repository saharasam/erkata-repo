import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Tier } from '@prisma/client';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import { UsersService } from '../users/users.service';

@Injectable()
export class UpgradesService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsGateway,
    private usersService: UsersService,
  ) {}

  async getActiveRequestForUser(agentId: string) {
    return this.prisma.upgradeRequest.findFirst({
      where: {
        agentId,
        status: { in: ['SUBMITTED', 'OPERATOR_VERIFIED'] },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createRequest(agentId: string, targetTier: Tier) {
    const agent = await this.prisma.profile.findUnique({
      where: { id: agentId },
      include: { package: true },
    });

    if (!agent) throw new NotFoundException('Agent not found');

    // Check if there's already a pending request
    const existing = await this.prisma.upgradeRequest.findFirst({
      where: {
        agentId,
        status: { in: ['SUBMITTED', 'OPERATOR_VERIFIED'] },
      },
    });

    if (existing) {
      throw new BadRequestException(
        'You already have a pending upgrade request.',
      );
    }

    return this.prisma.upgradeRequest.create({
      data: {
        agentId,
        currentTier: agent.tier,
        targetTier,
        status: 'SUBMITTED',
      },
    });
  }

  async uploadProof(requestId: string, agentId: string, proofUrl: string) {
    const request = await this.prisma.upgradeRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) throw new NotFoundException('Request not found');
    if (request.agentId !== agentId) {
      throw new ForbiddenException('Not your request');
    }

    const updated = await this.prisma.upgradeRequest.update({
      where: { id: requestId },
      data: { proofUrl },
    });

    // Notify Financial Operators
    this.notifications.sendToRole('financial_operator', 'notification', {
      type: 'upgrade.submitted',
      title: 'New Upgrade Proof',
      message: `Agent has uploaded proof for ${request.targetTier} upgrade.`,
      requestId: request.id,
    });

    return updated;
  }

  async getPendingForOperator() {
    return this.prisma.upgradeRequest.findMany({
      where: { status: 'SUBMITTED', proofUrl: { not: null } },
      include: {
        agent: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async verifyRequest(requestId: string, operatorId: string, note: string) {
    const request = await this.prisma.upgradeRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) throw new NotFoundException('Request not found');

    const updated = await this.prisma.upgradeRequest.update({
      where: { id: requestId },
      data: {
        status: 'OPERATOR_VERIFIED',
        internalNote: note,
        operatorId,
      },
    });

    // Notify Super Admins
    this.notifications.sendToRole('super_admin', 'notification', {
      type: 'upgrade.verified',
      title: 'Upgrade Verified by Operator',
      message: `A request for ${request.targetTier} has been verified and is ready for approval.`,
      requestId: request.id,
    });

    return updated;
  }

  async getVerifiedForAdmin() {
    return this.prisma.upgradeRequest.findMany({
      where: { status: 'OPERATOR_VERIFIED' },
      include: {
        agent: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
          },
        },
        operator: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async approveRequest(requestId: string, adminId: string) {
    const request = await this.prisma.upgradeRequest.findUnique({
      where: { id: requestId },
      include: { agent: true },
    });

    if (!request) throw new NotFoundException('Request not found');
    if (request.status !== 'OPERATOR_VERIFIED') {
      throw new BadRequestException(
        'Request must be verified by an operator first',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      // 1. Mark request as approved
      await tx.upgradeRequest.update({
        where: { id: requestId },
        data: {
          status: 'APPROVED',
          adminId,
        },
      });

      // 2. Perform the actual upgrade using UsersService
      await this.usersService.applyTierUpgrade(
        request.agentId,
        request.targetTier,
        'ETB',
        tx,
      );

      // 3. Create persistent notification
      await tx.notification.create({
        data: {
          userId: request.agentId,
          type: 'upgrade.approved',
          title: 'Upgrade Approved!',
          message: `Your account has been upgraded to ${request.targetTier}.`,
        },
      });

      // 4. Notify Agent (Real-time)
      this.notifications.sendToUser(request.agentId, 'notification', {
        type: 'upgrade.approved',
        title: 'Upgrade Approved!',
        message: `Your account has been upgraded to ${request.targetTier}.`,
      });

      return { success: true };
    });
  }

  async rejectRequest(requestId: string, adminId: string, reason: string) {
    const request = await this.prisma.upgradeRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) throw new NotFoundException('Request not found');

    await this.prisma.upgradeRequest.update({
      where: { id: requestId },
      data: {
        status: 'REJECTED',
        internalNote: `REJECTED: ${reason}. ${request.internalNote || ''}`,
        adminId,
      },
    });

    // Create persistent notification
    await this.prisma.notification.create({
      data: {
        userId: request.agentId,
        type: 'upgrade.rejected',
        title: 'Upgrade Request Denied',
        message: `Your upgrade request was rejected. Reason: ${reason}`,
      },
    });

    // Notify Agent (Real-time)
    this.notifications.sendToUser(request.agentId, 'notification', {
      type: 'upgrade.rejected',
      title: 'Upgrade Request Denied',
      message: `Your upgrade request was rejected. Reason: ${reason}`,
    });

    // Also notify operator if they were involved
    if (request.operatorId) {
      this.notifications.sendToUser(request.operatorId, 'notification', {
        type: 'upgrade.rejected',
        title: 'Request Denied by Admin',
        message: `The request you verified for agent ${request.agentId} was rejected by Super Admin.`,
      });
    }

    return { success: true };
  }
}
