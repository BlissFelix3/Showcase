import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { TypeOrmRepository } from '../../config/repository/typeorm.repository';
import { ChatMessage } from '../entities/chat-message.entity';

@Injectable()
export class ChatMessageRepository extends TypeOrmRepository<ChatMessage> {
  constructor(private readonly dataSource: DataSource) {
    super(ChatMessage, dataSource.createEntityManager());
  }
}
