import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ChatMessageRepository } from './repositories/chat-message.repository';
import { CreateMessageDto } from './dto/create-message.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { LocalEvents } from '../utils/constants';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    private readonly chatMessageRepository: ChatMessageRepository,
    private readonly notificationsService: NotificationsService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async sendMessage(createMessageDto: CreateMessageDto, senderId: string) {
    const message = this.chatMessageRepository.create({
      ...createMessageDto,
      sender: { id: senderId },
      recipient: { id: createMessageDto.recipientId },
      caseEntity: createMessageDto.caseId
        ? { id: createMessageDto.caseId }
        : null,
    });

    const savedMessage = await this.chatMessageRepository.save(message);

    // Send notification to recipient
    await this.notificationsService.sendPushNotification(
      createMessageDto.recipientId,
      'New Message',
      `New message from ${senderId}`,
    );

    // Emit new message event for notifications
    this.eventEmitter.emit(LocalEvents.CHAT_MESSAGE_RECEIVED, {
      userId: createMessageDto.recipientId,
      slug: 'chat-message-received',
      message: savedMessage,
    });

    return savedMessage;
  }

  async getConversation(userId1: string, userId2: string, caseId?: string) {
    const whereConditions: Array<{
      sender: { id: string };
      recipient: { id: string };
      caseEntity?: { id: string };
    }> = [
      { sender: { id: userId1 }, recipient: { id: userId2 } },
      { sender: { id: userId2 }, recipient: { id: userId1 } },
    ];

    if (caseId) {
      whereConditions.forEach((condition) => {
        condition.caseEntity = { id: caseId };
      });
    }

    return this.chatMessageRepository.find({
      where: whereConditions,
      relations: ['sender', 'recipient', 'caseEntity'],
      order: { createdAt: 'ASC' },
    });
  }

  async getCaseMessages(caseId: string) {
    return this.chatMessageRepository.find({
      where: { caseEntity: { id: caseId } },
      relations: ['sender', 'recipient'],
      order: { createdAt: 'ASC' },
    });
  }

  async getUserMessages(userId: string) {
    return this.chatMessageRepository.find({
      where: [{ sender: { id: userId } }, { recipient: { id: userId } }],
      relations: ['sender', 'recipient', 'caseEntity'],
      order: { createdAt: 'DESC' },
    });
  }

  async markAsRead(messageId: string, userId: string) {
    const message = await this.chatMessageRepository.findOne({
      where: { id: messageId, recipient: { id: userId } },
    });

    if (!message) {
      throw new Error('Message not found');
    }

    message.isRead = true;
    return this.chatMessageRepository.save(message);
  }

  async getUnreadCount(userId: string) {
    return this.chatMessageRepository.count({
      where: { recipient: { id: userId }, isRead: false },
    });
  }

  async deleteMessage(messageId: string, userId: string) {
    const message = await this.chatMessageRepository.findOne({
      where: { id: messageId, sender: { id: userId } },
    });

    if (!message) {
      throw new Error('Message not found or unauthorized');
    }

    await this.chatMessageRepository.remove(message);
  }

  async getLegalConsultation(
    userId: string,
    question: string,
    caseId?: string,
  ) {
    // Simulate AI legal consultation
    await new Promise((resolve) => setTimeout(resolve, 100)); // Simulate processing time

    const response = `AI Legal Consultation Response:
    
Question: ${question}

Based on your question, here are some general legal considerations:

1. **Legal Analysis**: This appears to be a matter that requires legal expertise
2. **Recommendations**: Consider consulting with a qualified lawyer
3. **Next Steps**: Document your situation and gather relevant information

Note: This is a simulated response. For actual legal advice, please consult with a qualified attorney.

Case ID: ${caseId || 'Not specified'}`;

    return response;
  }

  async searchMessages(userId: string, query: string, caseId?: string) {
    const whereConditions: Array<{
      sender?: { id: string };
      recipient?: { id: string };
      caseEntity?: { id: string };
    }> = [{ sender: { id: userId } }, { recipient: { id: userId } }];

    if (caseId) {
      whereConditions.forEach((condition) => {
        condition.caseEntity = { id: caseId };
      });
    }

    return this.chatMessageRepository
      .createQueryBuilder('message')
      .leftJoinAndSelect('message.sender', 'sender')
      .leftJoinAndSelect('message.recipient', 'recipient')
      .leftJoinAndSelect('message.caseEntity', 'caseEntity')
      .where(whereConditions)
      .andWhere('message.content ILIKE :query', { query: `%${query}%` })
      .orderBy('message.createdAt', 'DESC')
      .getMany();
  }

  async getMessageStats(userId: string) {
    const [totalMessages, unreadMessages] = await Promise.all([
      this.chatMessageRepository.count({
        where: [{ sender: { id: userId } }, { recipient: { id: userId } }],
      }),
      this.getUnreadCount(userId),
    ]);

    // Count unique conversations
    const conversations = await this.chatMessageRepository
      .createQueryBuilder('message')
      .select(
        'COUNT(DISTINCT CASE WHEN message.sender.id = :userId THEN message.recipient.id ELSE message.sender.id END)',
        'count',
      )
      .setParameter('userId', userId)
      .getRawOne();

    return {
      totalMessages,
      unreadMessages,
      conversations: parseInt(
        (conversations as { count: string })?.count || '0',
        10,
      ),
    };
  }
}
