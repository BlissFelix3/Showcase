import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { NotificationEvents } from './notification.events';
import { PushService } from './push.service';
import { NotificationRepository } from './repositories/notification.repository';
import { DeviceTokenRepository } from './repositories/device-token.repository';
import { NotificationTemplateRepository } from './repositories/notification-template.repository';
import { Notification } from './entities/notification.entity';
import { DeviceToken } from './entities/device-token.entity';
import { NotificationTemplate } from './entities/notification-template.entity';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Notification, DeviceToken, NotificationTemplate]),
    UsersModule,
  ],
  controllers: [NotificationController],
  providers: [
    NotificationService,
    NotificationEvents,
    PushService,
    NotificationRepository,
    DeviceTokenRepository,
    NotificationTemplateRepository,
  ],
  exports: [
    NotificationService,
    PushService,
    NotificationRepository,
    DeviceTokenRepository,
    NotificationTemplateRepository,
  ],
})
export class NotificationsModule {}
