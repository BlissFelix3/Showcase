import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { ChatMessageRepository } from './repositories/chat-message.repository';
import { NotificationsModule } from '../notifications/notification.module';

@Module({
  imports: [NotificationsModule],
  controllers: [ChatController],
  providers: [ChatService, ChatMessageRepository],
})
export class ChatModule {}
