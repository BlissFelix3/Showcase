import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { TypeOrmRepository } from '../../config/repository/typeorm.repository';
import { Subscription } from '../entities/subscription.entity';

@Injectable()
export class SubscriptionRepository extends TypeOrmRepository<Subscription> {
  constructor(private readonly dataSource: DataSource) {
    super(Subscription, dataSource.createEntityManager());
  }
}
