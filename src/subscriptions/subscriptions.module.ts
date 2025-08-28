import { Module } from '@nestjs/common';
import { SubscriptionsController } from './subscriptions.controller';
import { SubscriptionsService } from './subscriptions.service';
import { SubscriptionRepository } from './repositories/subscription.repository';

@Module({
  controllers: [SubscriptionsController],
  providers: [SubscriptionsService, SubscriptionRepository],
  exports: [SubscriptionRepository],
})
export class SubscriptionsModule {}
