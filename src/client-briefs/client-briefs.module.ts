import { Module } from '@nestjs/common';
import { ClientBriefsService } from './client-briefs.service';
import { ClientBriefRepository } from './repositories/client-brief.repository';
import { NotificationsModule } from '../notifications/notification.module';

@Module({
  imports: [NotificationsModule],
  providers: [ClientBriefsService, ClientBriefRepository],
  exports: [ClientBriefsService],
})
export class ClientBriefsModule {}
