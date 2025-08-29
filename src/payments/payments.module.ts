import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { PaystackService } from './paystack.service';
import { WebhookController } from './webhook/webhook.controller';
import { WebhookEventsService } from './webhook/webhook-events.service';
import { EscrowService } from './escrow/escrow.service';
import { PaymentRepository } from './repositories/payment.repository';
import { UsersModule } from '../users/users.module';
import { NotificationsModule } from '../notifications/notification.module';

@Module({
  imports: [UsersModule, NotificationsModule],
  controllers: [PaymentsController, WebhookController],
  providers: [
    PaymentsService,
    PaystackService,
    WebhookEventsService,
    EscrowService,
    PaymentRepository,
  ],
  exports: [PaymentsService, PaystackService, EscrowService],
})
export class PaymentsModule {}
