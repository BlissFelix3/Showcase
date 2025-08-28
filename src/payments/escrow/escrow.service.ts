import { Injectable, Logger } from '@nestjs/common';
import { Not, IsNull } from 'typeorm';
import { PaymentRepository } from '../repositories/payment.repository';
import { NotificationsService } from '../../notifications/notifications.service';
import { EscrowProvider, DummyEscrowProvider } from './escrow.provider';
import { PaymentStatus } from '../entities/payment.entity';

export interface EscrowDetails {
  escrowId: string;
  caseId: string;
  amountMinor: number;
  status: 'ACTIVE' | 'RELEASED' | 'CANCELLED';
  createdAt: Date;
  expiresAt: Date;
  metadata?: {
    milestoneId?: string;
    purpose?: string;
    lawyerId?: string;
    clientId?: string;
  };
}

export interface CreateEscrowRequest {
  caseId: string;
  amountMinor: number;
  milestoneId?: string;
  purpose: string;
  lawyerId: string;
  clientId: string;
  expiresInDays?: number;
}

export interface ReleaseEscrowRequest {
  escrowId: string;
  reason: string;
  releasedBy: string;
  amountMinor?: number; // Partial release amount
}

export interface EscrowResponse {
  escrowId: string;
  status: 'CREATED' | 'RELEASED' | 'CANCELLED';
  message: string;
  paymentId: string;
}

@Injectable()
export class EscrowService {
  private readonly logger = new Logger(EscrowService.name);
  private readonly escrowProvider: EscrowProvider = new DummyEscrowProvider();

  constructor(
    private readonly paymentRepository: PaymentRepository,
    private readonly notificationsService: NotificationsService,
  ) {}

  async createEscrow(request: {
    caseId: string;
    amountMinor: number;
    milestoneId?: string;
    purpose: string;
    lawyerId: string;
    clientId: string;
  }): Promise<EscrowResponse> {
    try {
      const escrowId = await this.escrowProvider.createEscrow(
        request.caseId,
        request.amountMinor,
        {
          milestoneId: request.milestoneId,
          purpose: request.purpose,
          lawyerId: request.lawyerId,
          clientId: request.clientId,
        },
      );

      // Create payment record
      const payment = this.paymentRepository.create({
        caseEntity: { id: request.caseId },
        milestone: request.milestoneId ? { id: request.milestoneId } : null,
        purpose: request.purpose,
        amountMinor: request.amountMinor,
        status: 'HELD_IN_ESCROW',
        provider: 'ESCROW',
        providerRef: escrowId.escrowId,
        escrowId: escrowId.escrowId,
      });

      const savedPayment = await this.paymentRepository.save(payment);

      // Send notifications
      await this.sendEscrowCreatedNotifications(request);

      return {
        escrowId: escrowId.escrowId,
        status: 'CREATED',
        message: 'Escrow created successfully',
        paymentId: savedPayment.id,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error creating escrow: ${errorMessage}`);
      throw new Error(`Failed to create escrow: ${errorMessage}`);
    }
  }

  async releaseEscrow(
    escrowId: string,
    reason: string,
    releasedBy: string,
    amountMinor?: number,
  ): Promise<EscrowResponse> {
    try {
      this.logger.log(`Releasing escrow: ${escrowId}, reason: ${reason}`);

      // Get escrow details
      const escrowDetails = await this.getEscrowDetails(escrowId);
      if (!escrowDetails) {
        throw new Error('Escrow not found');
      }

      // Release escrow with provider
      const result = await this.escrowProvider.releaseEscrow(
        escrowId,
        amountMinor,
      );

      if (result.released) {
        // Update payment status
        const payment = await this.paymentRepository.findOne({
          where: { escrowId },
        });

        if (payment) {
          payment.status = 'COMPLETED';
          await this.paymentRepository.save(payment);
        }

        // Send notifications
        await this.sendEscrowReleasedNotifications(escrowDetails);

        return {
          escrowId,
          status: 'RELEASED',
          message: 'Escrow released successfully',
          paymentId: payment?.id || '',
        };
      } else {
        throw new Error('Failed to release escrow');
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error releasing escrow: ${errorMessage}`);
      throw new Error(`Failed to release escrow: ${errorMessage}`);
    }
  }

  async getEscrowDetails(escrowId: string): Promise<EscrowDetails | null> {
    try {
      const payment = await this.paymentRepository.findOne({
        where: { escrowId },
        relations: ['caseEntity', 'milestone'],
      });

      if (!payment) {
        return null;
      }

      // Get escrow status from provider
      const escrowStatus = await this.escrowProvider.getEscrowStatus(escrowId);

      return {
        escrowId,
        caseId: payment.caseEntity?.id || '',
        amountMinor: payment.amountMinor,
        status: escrowStatus.status as 'ACTIVE' | 'RELEASED' | 'CANCELLED',
        createdAt: payment.createdAt,
        expiresAt: new Date(
          payment.createdAt.getTime() + 365 * 24 * 60 * 60 * 1000,
        ), // 1 year from creation
        metadata: {
          milestoneId: payment.milestone?.id,
          purpose: payment.purpose,
          lawyerId: payment.caseEntity?.lawyer?.id,
          clientId: payment.caseEntity?.client?.id,
        },
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error getting escrow details: ${errorMessage}`);
      return null;
    }
  }

  async getEscrowsByCase(caseId: string): Promise<EscrowDetails[]> {
    try {
      const payments = await this.paymentRepository.find({
        where: { caseEntity: { id: caseId } },
        relations: ['caseEntity', 'milestone'],
      });

      const escrowDetails: EscrowDetails[] = [];

      for (const payment of payments) {
        if (payment.escrowId) {
          const details = await this.getEscrowDetails(payment.escrowId);
          if (details) {
            escrowDetails.push(details);
          }
        }
      }

      return escrowDetails;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error getting escrows by case: ${errorMessage}`);
      return [];
    }
  }

  async cancelEscrow(
    escrowId: string,
    reason: string,
    cancelledBy: string,
  ): Promise<EscrowResponse> {
    try {
      this.logger.log(`Cancelling escrow: ${escrowId}, reason: ${reason}`);

      // Cancel escrow with provider
      const result = await this.escrowProvider.cancelEscrow(escrowId);

      if (result.cancelled) {
        // Update payment status
        const payment = await this.paymentRepository.findOne({
          where: { escrowId },
        });

        if (payment) {
          payment.status = 'CANCELLED';
          await this.paymentRepository.save(payment);
        }

        // Send notifications
        await this.sendEscrowCancelledNotifications(
          escrowId,
          reason,
          cancelledBy,
        );

        return {
          escrowId,
          status: 'CANCELLED',
          message: 'Escrow cancelled successfully',
          paymentId: payment?.id || '',
        };
      } else {
        throw new Error('Failed to cancel escrow');
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error cancelling escrow: ${errorMessage}`);
      throw new Error(`Failed to cancel escrow: ${errorMessage}`);
    }
  }

  async getExpiringEscrows(
    daysThreshold: number = 30,
  ): Promise<EscrowDetails[]> {
    try {
      const payments = await this.paymentRepository.find({
        where: { escrowId: Not(IsNull()) },
        relations: ['caseEntity', 'milestone'],
      });

      const thresholdDate = new Date();
      thresholdDate.setDate(thresholdDate.getDate() + daysThreshold);

      const expiringEscrows: EscrowDetails[] = [];

      for (const payment of payments) {
        if (payment.escrowId) {
          const details = await this.getEscrowDetails(payment.escrowId);
          if (details && details.expiresAt <= thresholdDate) {
            expiringEscrows.push(details);
          }
        }
      }

      return expiringEscrows;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error getting expiring escrows: ${errorMessage}`);
      return [];
    }
  }

  private mapPaymentStatusToEscrowStatus(
    paymentStatus: PaymentStatus,
  ): 'ACTIVE' | 'RELEASED' | 'CANCELLED' {
    switch (paymentStatus) {
      case 'HELD_IN_ESCROW':
        return 'ACTIVE';
      case 'RELEASED':
        return 'RELEASED';
      case 'CANCELLED':
        return 'CANCELLED';
      default:
        return 'ACTIVE';
    }
  }

  private async sendEscrowCreatedNotifications(escrowDetails: {
    caseId: string;
    amountMinor: number;
    purpose: string;
    lawyerId: string;
    clientId: string;
  }): Promise<void> {
    try {
      // Send notification to lawyer
      await this.notificationsService.sendPushNotification(
        escrowDetails.lawyerId,
        'Escrow Created',
        `Escrow of ₦${escrowDetails.amountMinor / 100} created for case ${escrowDetails.caseId}`,
      );

      // Send notification to client
      await this.notificationsService.sendPushNotification(
        escrowDetails.clientId,
        'Escrow Created',
        `Escrow of ₦${escrowDetails.amountMinor / 100} created for case ${escrowDetails.caseId}`,
      );

      // Send email notifications
      await this.notificationsService.sendEmail({
        to: 'lawyer@example.com', // Get from user service
        subject: 'Escrow Created',
        template: 'escrow-created',
        data: {
          amount: (escrowDetails.amountMinor / 100).toString(),
          caseId: escrowDetails.caseId,
          purpose: escrowDetails.purpose,
          date: new Date().toLocaleDateString(),
        },
      });

      await this.notificationsService.sendEmail({
        to: 'client@example.com', // Get from user service
        subject: 'Escrow Created',
        template: 'escrow-created-client',
        data: {
          amount: (escrowDetails.amountMinor / 100).toString(),
          caseId: escrowDetails.caseId,
          purpose: escrowDetails.purpose,
          date: new Date().toLocaleDateString(),
        },
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Error sending escrow created notifications: ${errorMessage}`,
      );
    }
  }

  private async sendEscrowReleasedNotifications(
    escrowDetails: EscrowDetails,
  ): Promise<void> {
    try {
      const metadata = escrowDetails.metadata;
      if (!metadata) return;

      // Send notification to lawyer
      if (metadata.lawyerId) {
        await this.notificationsService.sendPushNotification(
          metadata.lawyerId,
          'Escrow Released',
          `Escrow of ₦${escrowDetails.amountMinor / 100} released for case ${escrowDetails.caseId}`,
        );
      }

      // Send notification to client
      if (metadata.clientId) {
        await this.notificationsService.sendPushNotification(
          metadata.clientId,
          'Escrow Released',
          `Escrow of ₦${escrowDetails.amountMinor / 100} released for case ${escrowDetails.caseId}`,
        );
      }

      // Send email notifications
      if (metadata.lawyerId) {
        await this.notificationsService.sendEmail({
          to: 'lawyer@example.com', // Get from user service
          subject: 'Escrow Released',
          template: 'escrow-released',
          data: {
            amount: (escrowDetails.amountMinor / 100).toString(),
            caseId: escrowDetails.caseId,
            purpose: escrowDetails.metadata?.purpose || 'Unknown',
            date: new Date().toLocaleDateString(),
          },
        });
      }

      if (metadata.clientId) {
        await this.notificationsService.sendEmail({
          to: 'client@example.com', // Get from user service
          subject: 'Escrow Released',
          template: 'escrow-released',
          data: {
            amount: (escrowDetails.amountMinor / 100).toString(),
            caseId: escrowDetails.caseId,
            purpose: escrowDetails.metadata?.purpose || 'Unknown',
            date: new Date().toLocaleDateString(),
          },
        });
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Error sending escrow released notifications: ${errorMessage}`,
      );
    }
  }

  private async sendEscrowCancelledNotifications(
    escrowId: string,
    reason: string,
    cancelledBy: string,
  ): Promise<void> {
    try {
      const escrowDetails = await this.getEscrowDetails(escrowId);
      if (!escrowDetails) return;

      const metadata = escrowDetails.metadata;
      if (!metadata) return;

      // Send notification to lawyer
      if (metadata.lawyerId) {
        await this.notificationsService.sendPushNotification(
          metadata.lawyerId,
          'Escrow Cancelled',
          `Escrow of ₦${escrowDetails.amountMinor / 100} cancelled for case ${escrowDetails.caseId}`,
        );
      }

      // Send notification to client
      if (metadata.clientId) {
        await this.notificationsService.sendPushNotification(
          metadata.clientId,
          'Escrow Cancelled',
          `Escrow of ₦${escrowDetails.amountMinor / 100} cancelled for case ${escrowDetails.caseId}`,
        );
      }

      // Send email notifications
      if (metadata.lawyerId) {
        await this.notificationsService.sendEmail({
          to: 'lawyer@example.com', // Get from user service
          subject: 'Escrow Cancelled',
          template: 'escrow-cancelled',
          data: {
            amount: (escrowDetails.amountMinor / 100).toString(),
            caseId: escrowDetails.caseId,
            reason,
            cancelledBy,
            date: new Date().toLocaleDateString(),
          },
        });
      }

      if (metadata.clientId) {
        await this.notificationsService.sendEmail({
          to: 'client@example.com', // Get from user service
          subject: 'Escrow Cancelled',
          template: 'escrow-cancelled',
          data: {
            amount: (escrowDetails.amountMinor / 100).toString(),
            caseId: escrowDetails.caseId,
            reason,
            cancelledBy,
            date: new Date().toLocaleDateString(),
          },
        });
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Error sending escrow cancelled notifications: ${errorMessage}`,
      );
    }
  }
}
