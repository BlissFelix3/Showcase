import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Subscription } from './entities/subscription.entity';
import { SubscriptionRepository } from './repositories/subscription.repository';
import { LocalEvents } from '../utils/constants';

@Injectable()
export class SubscriptionsService {
  constructor(
    private readonly subscriptionRepo: SubscriptionRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async start(lawyerUserId: string, months: number): Promise<Subscription> {
    const now = new Date();
    const end = new Date(now);
    end.setMonth(end.getMonth() + months);
    const entity = this.subscriptionRepo.create({
      lawyer: { id: lawyerUserId },
      status: 'ACTIVE',
      startDate: now.toISOString().slice(0, 10),
      endDate: end.toISOString().slice(0, 10),
    });

    const savedSubscription = await this.subscriptionRepo.save(entity);

    return savedSubscription;
  }
}
