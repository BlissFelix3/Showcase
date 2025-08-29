import { Injectable, Logger } from '@nestjs/common';
import { PaymentRepository } from '../repositories/payment.repository';
import { NotificationService } from '../../notifications/notification.service';
import { EmailService } from '../../email/email.service';

export interface WebhookEvent {
  event: string;
  data: {
    reference: string;
    status: string;
    amount: number;
    customer: {
      email: string;
      customer_code: string;
    };
    metadata?: {
      caseId?: string;
      milestoneId?: string;
      purpose?: string;
    };
    [key: string]: any;
  };
}

@Injectable()
export class WebhookEventsService {
  private readonly logger = new Logger(WebhookEventsService.name);

  constructor(
    private readonly paymentRepository: PaymentRepository,
    private readonly notificationService: NotificationService,
    private readonly emailService: EmailService,
  ) {}

  async processWebhookEvent(
    event: WebhookEvent,
  ): Promise<{ processed: boolean; result: any }> {
    try {
      this.logger.log(`Processing webhook event: ${event.event}`);

      switch (event.event) {
        case 'charge.success':
          return await this.handleChargeSuccess(event);
        case 'charge.failed':
          return await this.handleChargeFailed(event);
        case 'transfer.success':
          return await this.handleTransferSuccess(event);
        case 'transfer.failed':
          return await this.handleTransferFailed(event);
        case 'refund.processed':
          return await this.handleRefundProcessed(event);
        default:
          this.logger.warn(`Unhandled webhook event: ${event.event}`);
          return { processed: false, result: { message: 'Event not handled' } };
      }
    } catch (error) {
      this.logger.error(
        `Error processing webhook event: ${error.message}`,
        error.stack,
      );
      return { processed: false, result: { error: error.message } };
    }
  }

  private async handleChargeSuccess(
    event: WebhookEvent,
  ): Promise<{ processed: boolean; result: any }> {
    const { reference, status, amount, customer, metadata } = event.data;

    try {
      const payment = await this.paymentRepository.findOne({
        where: { providerRef: reference },
        relations: ['caseEntity', 'milestone'],
      });

      if (!payment) {
        this.logger.warn(`Payment not found for reference: ${reference}`);
        return { processed: false, result: { message: 'Payment not found' } };
      }

      payment.status = 'COMPLETED';
      await this.paymentRepository.save(payment);

      if (payment.purpose === 'consultation') {
        return await this.handleConsultationPayment(payment, customer);
      } else if (payment.purpose === 'milestone') {
        return await this.handleMilestonePayment(payment, customer);
      } else if (payment.purpose === 'escrow_full_fee') {
        return await this.handleEscrowPayment(payment, customer);
      }

      await this.sendPaymentSuccessNotification(payment, customer.email);

      return {
        processed: true,
        result: {
          message: 'Payment processed successfully',
          paymentId: payment.id,
          status: payment.status,
        },
      };
    } catch (error) {
      this.logger.error(`Error handling charge success: ${error.message}`);
      throw error;
    }
  }

  private async handleChargeFailed(
    event: WebhookEvent,
  ): Promise<{ processed: boolean; result: any }> {
    const { reference, customer, metadata } = event.data;

    try {
      const payment = await this.paymentRepository.findOne({
        where: { providerRef: reference },
      });

      if (payment) {
        payment.status = 'FAILED';
        await this.paymentRepository.save(payment);
      }

      await this.sendPaymentFailureNotification(customer.email, reference);

      return {
        processed: true,
        result: {
          message: 'Payment failure processed',
          reference,
        },
      };
    } catch (error) {
      this.logger.error(`Error handling charge failure: ${error.message}`);
      throw error;
    }
  }

  private async handleTransferSuccess(
    event: WebhookEvent,
  ): Promise<{ processed: boolean; result: any }> {
    const { reference, amount, customer } = event.data;

    this.logger.log(`Transfer successful: ${reference} for ${amount}`);

    return {
      processed: true,
      result: {
        message: 'Transfer success processed',
        reference,
      },
    };
  }

  private async handleTransferFailed(
    event: WebhookEvent,
  ): Promise<{ processed: boolean; result: any }> {
    const { reference, customer } = event.data;

    this.logger.log(`Transfer failed: ${reference}`);

    await this.sendTransferFailureNotification(customer.email, reference);

    return {
      processed: true,
      result: {
        message: 'Transfer failure processed',
        reference,
      },
    };
  }

  private async handleRefundProcessed(
    event: WebhookEvent,
  ): Promise<{ processed: boolean; result: any }> {
    const { reference, amount, customer } = event.data;

    try {
      const payment = await this.paymentRepository.findOne({
        where: { providerRef: reference },
      });

      if (payment) {
        payment.status = 'REFUNDED';
        await this.paymentRepository.save(payment);
      }

      await this.sendRefundNotification(customer.email, reference, amount);

      return {
        processed: true,
        result: {
          message: 'Refund processed',
          reference,
        },
      };
    } catch (error) {
      this.logger.error(`Error handling refund: ${error.message}`);
      throw error;
    }
  }

  private async handleConsultationPayment(
    payment: any,
    customer: any,
  ): Promise<{ processed: boolean; result: any }> {
    this.logger.log(`Consultation payment confirmed: ${payment.id}`);

    await this.sendConsultationConfirmation(
      customer.email,
      payment.amountMinor,
    );

    return {
      processed: true,
      result: {
        message: 'Consultation payment processed',
        type: 'consultation',
      },
    };
  }

  private async handleMilestonePayment(
    payment: any,
    customer: any,
  ): Promise<{ processed: boolean; result: any }> {
    if (payment.milestone) {
      this.logger.log(`Milestone ID for payment: ${payment.milestone.id}`);
    }

    return {
      processed: true,
      result: {
        message: 'Milestone payment processed',
        type: 'milestone',
      },
    };
  }

  private async handleEscrowPayment(
    payment: any,
    customer: any,
  ): Promise<{ processed: boolean; result: any }> {
    this.logger.log(`Escrow payment confirmed: ${payment.id}`);

    await this.sendEscrowConfirmation(
      customer.email,
      payment.amountMinor,
      payment.caseEntity?.id,
    );

    return {
      processed: true,
      result: {
        message: 'Escrow payment processed',
        type: 'escrow',
      },
    };
  }

  private async sendPaymentSuccessNotification(
    payment: any,
    email: string,
  ): Promise<void> {
    try {
      await this.notificationService.createNotification({
        userId: payment.userId || 'system',
        title: 'Payment Successful',
        message: `Payment of ₦${payment.amountMinor / 100} for ${payment.purpose} was successful`,
        metadata: {
          amount: payment.amountMinor / 100,
          purpose: payment.purpose,
          date: new Date().toLocaleDateString(),
        },
      });
    } catch (error) {
      this.logger.error(
        `Failed to send payment success notification: ${error.message}`,
      );
    }
  }

  private async sendPaymentFailureNotification(
    email: string,
    reference: string,
  ): Promise<void> {
    try {
      await this.notificationService.createNotification({
        userId: 'system',
        title: 'Payment Failed',
        message: `Payment with reference ${reference} has failed`,
        metadata: {
          reference,
          date: new Date().toLocaleDateString(),
        },
      });
    } catch (error) {
      this.logger.error(
        `Failed to send payment failure notification: ${error.message}`,
      );
    }
  }

  private async sendTransferFailureNotification(
    email: string,
    reference: string,
  ): Promise<void> {
    try {
      await this.emailService.sendTemplatedEmail(email, 'transfer-failure', {
        reference,
        date: new Date().toLocaleDateString(),
      });
    } catch (error) {
      this.logger.error(
        `Failed to send transfer failure notification: ${error.message}`,
      );
    }
  }

  private async sendRefundNotification(
    email: string,
    reference: string,
    amount: number,
  ): Promise<void> {
    try {
      await this.emailService.sendTemplatedEmail(email, 'refund-processed', {
        reference,
        amount: amount / 100,
        date: new Date().toLocaleDateString(),
      });
    } catch (error) {
      this.logger.error(`Failed to send refund notification: ${error.message}`);
    }
  }

  private async sendConsultationConfirmation(
    email: string,
    amountMinor: number,
  ): Promise<void> {
    try {
      await this.emailService.sendTemplatedEmail(
        email,
        'consultation-confirmed',
        {
          amount: amountMinor / 100,
          date: new Date().toLocaleDateString(),
        },
      );
    } catch (error) {
      this.logger.error(
        `Failed to send consultation confirmation: ${error.message}`,
      );
    }
  }

  private async sendEscrowConfirmation(
    email: string,
    amountMinor: number,
    caseId?: string,
  ): Promise<void> {
    try {
      await this.emailService.sendTemplatedEmail(email, 'escrow-confirmed', {
        amount: amountMinor / 100,
        caseId,
        date: new Date().toLocaleDateString(),
      });
    } catch (error) {
      this.logger.error(`Failed to send escrow confirmation: ${error.message}`);
    }
  }
}
