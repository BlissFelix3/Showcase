import { Module } from '@nestjs/common';
import { AppealsService } from './appeals.service';
import { AppealRepository } from './repositories/appeal.repository';
import { NotificationsModule } from '../notifications/notification.module';

@Module({
  imports: [NotificationsModule],
  providers: [AppealsService, AppealRepository],
  exports: [AppealsService],
})
export class AppealsModule {}
