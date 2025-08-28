import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PaymentRepository } from './repositories/payment.repository';
import { PaystackService } from './paystack.service';
import { EscrowService } from './escrow/escrow.service';
import { WebhookEventsService } from './webhook/webhook-events.service';
import { DummyEscrowProvider } from './escrow/escrow.provider';
import { LocalEvents } from '../utils/constants';
import type { EscrowProvider } from './escrow/escrow.provider';
import type { PaymentStatus } from './entities/payment.entity';

@Injectable()
export class PaymentsService {
  private readonly escrow: EscrowProvider = new DummyEscrowProvider();

  constructor(
    private readonly paymentRepository: PaymentRepository,
    private readonly paystackService: PaystackService,
    private readonly webhookEventsService: WebhookEventsService,
    private readonly escrowService: EscrowService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async createConsultationPayment(clientId: string, amountMinor: number) {
    const payment = this.paymentRepository.create({
      caseEntity: null,
      milestone: null,
      purpose: 'ai_consultation',
      amountMinor,
      status: 'PENDING',
      provider: 'PAYSTACK',
      providerRef: null,
      escrowId: null,
    });

    const savedPayment = await this.paymentRepository.save(payment);

    // Initialize Paystack payment
    const paystackResponse = await this.paystackService.initTransaction(
      'client@example.com', // Get from user service
      amountMinor,
      savedPayment.id,
    );

    savedPayment.providerRef = paystackResponse.reference;
    return this.paymentRepository.save(savedPayment);
  }

  async verifyConsultation(reference: string) {
    const verified = await this.paystackService.verifyTransaction(reference);

    if (verified.status === 'success') {
      const payment = await this.paymentRepository.findOne({
        where: { providerRef: reference },
      });

      if (payment) {
        payment.status = 'COMPLETED';
        const savedPayment = await this.paymentRepository.save(payment);

        // Emit consultation payment confirmed event for notifications
        this.eventEmitter.emit(LocalEvents.AI_CONSULTATION_PAYMENT_CONFIRMED, {
          userId: 'client-id', // Get from payment context
          slug: 'consultation-payment-confirmed',
          consultation: {
            id: 'consultation-id', // Get from payment context
            amountMinor: savedPayment.amountMinor,
          },
        });
      }
    }

    return { verified: verified.status === 'success', transaction: verified };
  }

  async createEscrowPayment(request: {
    caseId: string;
    amountMinor: number;
    milestoneId?: string;
    purpose: string;
    lawyerId: string;
    clientId: string;
  }) {
    return await this.escrowService.createEscrow(request);
  }

  async releaseEscrow(
    escrowId: string,
    reason: string,
    releasedBy: string,
    amountMinor?: number,
  ) {
    return await this.escrowService.releaseEscrow(
      escrowId,
      reason,
      releasedBy,
      amountMinor,
    );
  }

  async getEscrowDetails(escrowId: string) {
    return await this.escrowService.getEscrowDetails(escrowId);
  }

  async getEscrowsByCase(caseId: string) {
    return await this.escrowService.getEscrowsByCase(caseId);
  }

  async cancelEscrow(escrowId: string, reason: string, cancelledBy: string) {
    return await this.escrowService.cancelEscrow(escrowId, reason, cancelledBy);
  }

  async getExpiringEscrows(daysThreshold: number = 30) {
    return await this.escrowService.getExpiringEscrows(daysThreshold);
  }

  async processWebhookEvent(event: any) {
    return await this.webhookEventsService.processWebhookEvent(event);
  }

  validateWebhookSignature(payload: string, signature: string): boolean {
    return this.paystackService.validateWebhookSignature(payload, signature);
  }

  async getPaymentHistory(
    userId: string,
    filters?: {
      status?: PaymentStatus;
      purpose?: string;
      provider?: string;
      startDate?: Date;
      endDate?: Date;
    },
  ) {
    const queryBuilder = this.paymentRepository
      .createQueryBuilder('payment')
      .leftJoinAndSelect('payment.caseEntity', 'case')
      .leftJoinAndSelect('payment.milestone', 'milestone')
      .where('case.client.id = :userId OR case.lawyer.id = :userId', {
        userId,
      });

    if (filters?.status) {
      queryBuilder.andWhere('payment.status = :status', {
        status: filters.status,
      });
    }

    if (filters?.purpose) {
      queryBuilder.andWhere('payment.purpose = :purpose', {
        purpose: filters.purpose,
      });
    }

    if (filters?.provider) {
      queryBuilder.andWhere('payment.provider = :provider', {
        provider: filters.provider,
      });
    }

    if (filters?.startDate) {
      queryBuilder.andWhere('payment.createdAt >= :startDate', {
        startDate: filters.startDate,
      });
    }

    if (filters?.endDate) {
      queryBuilder.andWhere('payment.createdAt <= :endDate', {
        endDate: filters.endDate,
      });
    }

    queryBuilder.orderBy('payment.createdAt', 'DESC');

    return await queryBuilder.getMany();
  }

  async getPaymentStatistics(userId: string) {
    const totalPayments = await this.paymentRepository.count({
      where: [
        { caseEntity: { client: { id: userId } } },
        { caseEntity: { lawyer: { id: userId } } },
      ],
    });

    const completedPayments = await this.paymentRepository.count({
      where: [
        { caseEntity: { client: { id: userId } }, status: 'COMPLETED' },
        { caseEntity: { lawyer: { id: userId } }, status: 'COMPLETED' },
      ],
    });

    const pendingPayments = await this.paymentRepository.count({
      where: [
        { caseEntity: { client: { id: userId } }, status: 'PENDING' },
        { caseEntity: { lawyer: { id: userId } }, status: 'PENDING' },
      ],
    });

    const escrowPayments = await this.paymentRepository.count({
      where: [
        { caseEntity: { client: { id: userId } }, status: 'HELD_IN_ESCROW' },
        { caseEntity: { lawyer: { id: userId } }, status: 'HELD_IN_ESCROW' },
      ],
    });

    const totalAmount = await this.paymentRepository
      .createQueryBuilder('payment')
      .leftJoin('payment.caseEntity', 'case')
      .where('case.client.id = :userId OR case.lawyer.id = :userId', { userId })
      .andWhere('payment.status IN (:...statuses)', {
        statuses: ['COMPLETED', 'HELD_IN_ESCROW'],
      })
      .select('SUM(payment.amountMinor)', 'total')
      .getRawOne();

    return {
      totalPayments,
      completedPayments,
      pendingPayments,
      escrowPayments,
      totalAmountMinor: parseInt(totalAmount?.total || '0'),
      successRate:
        totalPayments > 0 ? (completedPayments / totalPayments) * 100 : 0,
    };
  }
}
