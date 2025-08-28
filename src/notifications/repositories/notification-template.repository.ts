import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { TypeOrmRepository } from '../../config/repository/typeorm.repository';
import { NotificationTemplate } from '../entities/notification-template.entity';

@Injectable()
export class NotificationTemplateRepository extends TypeOrmRepository<NotificationTemplate> {
  constructor(private readonly dataSource: DataSource) {
    super(NotificationTemplate, dataSource.createEntityManager());
  }
}
