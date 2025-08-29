import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { NotificationRepository } from './repositories/notification.repository';
import { DeviceTokenRepository } from './repositories/device-token.repository';
import { NotificationTemplateRepository } from './repositories/notification-template.repository';
import {
  IAddDeviceToken,
  ICreateNotification,
  ISendTopicNotification,
  ISubscribeToTopic,
  IUnsubscribeFromTopic,
  IUpdateNotification,
  ISendNotificationWithTemplate,
} from './interfaces/notification.interface';
import { UsersService } from '../users/users.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { LocalEvents } from 'src/utils/constants';
import { PushService } from './push.service';
import { CreateNotificationTemplateDto } from './dto/create-notification-template.dto';

@Injectable()
export class NotificationService {
  constructor(
    private readonly notificationRepository: NotificationRepository,
    private readonly deviceTokenRepository: DeviceTokenRepository,
    private readonly notificationTemplateRepository: NotificationTemplateRepository,
    private readonly userService: UsersService,
    private readonly eventEmitter: EventEmitter2,
    private readonly pushService: PushService,
  ) {}

  async createNotification(data: ICreateNotification) {
    const user = await this.userService.findByIdOrFail(data.userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const notification = await this.notificationRepository.save({
      ...data,
      isRead: false,
      metadata: data.metadata ? JSON.stringify(data.metadata) : undefined,
    });

    this.eventEmitter.emit(LocalEvents.NOTIFICATION_CREATED, {
      notification,
      user,
    });

    return notification;
  }

  async notificationExists(userId: string, title: string): Promise<boolean> {
    const notification = await this.notificationRepository.findOne({
      where: { userId, title },
    });

    return !!notification;
  }

  async createTemplate(data: CreateNotificationTemplateDto) {
    const template = await this.notificationTemplateRepository.findOne({
      where: { slug: data.slug },
    });

    if (template) {
      throw new ConflictException('Template with this slug already exists');
    }

    return this.notificationTemplateRepository.save(data);
  }

  async getTemplateBySlug(slug: string) {
    const template = await this.notificationTemplateRepository.findOne({
      where: { slug },
    });

    if (!template) {
      throw new NotFoundException(
        `Notification template not found for slug: ${slug}`,
      );
    }

    return template;
  }

  async sendNotificationWithTemplate(data: ISendNotificationWithTemplate) {
    const template = await this.getTemplateBySlug(data.templateSlug);
    const deviceTokens = await this.getUserDeviceTokens(data.userId);

    const user = await this.userService.findByIdOrFail(data.userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    let notificationMessage = template.message;

    // Replace template variables with actual data
    if (data.data) {
      Object.entries(data.data).forEach(([key, value]) => {
        const placeholder = new RegExp(`{{${key}}}`, 'g');
        notificationMessage = notificationMessage.replace(
          placeholder,
          String(value),
        );
      });
    }

    const notificationPayload = {
      notification: {
        title: template.title,
        body: notificationMessage,
        imageUrl: data.data?.imageUrl || template.imageUrl,
      },
      data: {
        notificationId: template.id,
        slug: template.slug,
        category: template.category,
        ...data.data,
      },
    };

    // Save in-app notification
    await this.notificationRepository.save({
      title: notificationPayload.notification.title,
      message: notificationPayload.notification.body,
      imageUrl: notificationPayload.notification.imageUrl,
      userId: user.id,
      slug: template.slug,
      category: template.category,
      priority: template.priority,
      isRead: false,
      metadata: data.data ? JSON.stringify(data.data) : undefined,
    });

    // Send push notification if device tokens exist
    if (deviceTokens.length > 0) {
      await this.pushService.sendToToken(deviceTokens, notificationPayload);
    }

    return { success: true, message: 'Notification sent successfully' };
  }

  async getUserUniqueDeviceTokens(userId: string): Promise<string[]> {
    const tokens = await this.deviceTokenRepository.find({ where: { userId } });

    const uniqueTokens = [...new Set(tokens.map((token) => token.deviceToken))];

    return uniqueTokens;
  }

  async updateNotification(data: IUpdateNotification) {
    const notification = await this.notificationRepository.findOne({
      where: { id: data.id },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    notification.isRead = data.isRead;

    return await this.notificationRepository.save(notification);
  }

  async getUserNotifications(userId: string) {
    return await this.notificationRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async clearAllUserNotifications(userId: string) {
    try {
      const notifications = await this.notificationRepository.find({
        where: { userId },
      });

      if (notifications.length === 0) {
        throw new NotFoundException('No notifications found for this user');
      }

      await this.notificationRepository.delete({ userId });

      return {
        message: 'All notifications cleared successfully',
        status: true,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        'Error clearing notifications for user',
        error.message,
      );
    }
  }

  async markAsRead(notificationId: string) {
    const notification = await this.notificationRepository.findOne({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    notification.isRead = true;

    return await this.notificationRepository.save(notification);
  }

  async addDeviceToken(data: IAddDeviceToken) {
    const existingToken = await this.deviceTokenRepository.findOne({
      where: {
        userId: data.userId,
        deviceToken: data.deviceToken,
      },
    });

    if (existingToken) {
      return {
        message: 'Device token already exists',
        status: false,
      };
    }

    await this.deviceTokenRepository.save({
      userId: data.userId,
      deviceToken: data.deviceToken,
      deviceId: data.deviceId,
      deviceType: data.deviceType,
      appVersion: data.appVersion,
    });

    return {
      message: 'Device token added successfully',
      status: true,
    };
  }

  async sendTopicNotification(data: ISendTopicNotification) {
    await this.pushService.sendToTopic([data.topic], {
      notification: {
        title: data.title,
        body: data.body,
      },
      data: data.data || {},
    });

    return {
      message: 'Notification sent to topic successfully',
      status: true,
    };
  }

  async subscribeToTopic(data: ISubscribeToTopic) {
    await this.pushService.subscribeToTopic([data.topic], [data.deviceToken]);
    return {
      message: 'Subscribed to topic successfully',
      status: true,
    };
  }

  async unsubscribeFromTopic(data: IUnsubscribeFromTopic) {
    await this.pushService.unSubscribeToTopic([data.topic], [data.deviceToken]);
    return {
      message: 'Unsubscribed from topic successfully',
      status: true,
    };
  }

  async removeDeviceToken(deviceToken: string) {
    try {
      await this.deviceTokenRepository.delete({ deviceToken });
    } catch (error) {
      console.error(
        `Failed to remove device token ${deviceToken}:`,
        error.message,
      );
    }
  }

  async getUserDeviceTokens(userId: string) {
    const tokens = await this.deviceTokenRepository.find({
      where: { userId },
    });

    return tokens.map((token) => token.deviceToken);
  }
}
