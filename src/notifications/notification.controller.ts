import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Param,
  UseGuards,
  Delete,
  Query,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { AddDeviceTokenDto } from './dto/device-token.dto';
import { SendTopicNotificationDto } from './dto/send-topic-notification.dto';
import {
  SubscribeToTopicDto,
  UnsubscribeFromTopicDto,
} from './dto/topic-subscription.dto';
import { CreateNotificationTemplateDto } from './dto/create-notification-template.dto';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';

@ApiTags('Notifications')
@Controller('notifications')
@ApiBearerAuth('JWT')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new notification' })
  @ApiResponse({
    status: 201,
    description: 'Notification created successfully',
  })
  create(@Body() createNotificationDto: CreateNotificationDto) {
    return this.notificationService.createNotification(createNotificationDto);
  }

  @Post('template')
  @ApiOperation({ summary: 'Create a notification template' })
  @ApiResponse({ status: 201, description: 'Template created successfully' })
  createTemplate(
    @Body() createNotificationTemplateDto: CreateNotificationTemplateDto,
  ) {
    return this.notificationService.createTemplate(
      createNotificationTemplateDto,
    );
  }

  @Post('send-template')
  @ApiOperation({ summary: 'Send notification using a template' })
  @ApiResponse({ status: 200, description: 'Notification sent successfully' })
  sendWithTemplate(
    @Body()
    data: {
      userId: string;
      templateSlug: string;
      data?: Record<string, any>;
      language?: string;
    },
  ) {
    return this.notificationService.sendNotificationWithTemplate(data);
  }

  @Put()
  @ApiOperation({ summary: 'Update notification read status' })
  @ApiResponse({
    status: 200,
    description: 'Notification updated successfully',
  })
  update(@Body() updateNotificationDto: UpdateNotificationDto) {
    return this.notificationService.updateNotification(updateNotificationDto);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get user notifications' })
  @ApiResponse({
    status: 200,
    description: 'Notifications retrieved successfully',
  })
  getUserNotifications(@Param('userId') userId: string) {
    return this.notificationService.getUserNotifications(userId);
  }

  @Get('user/:userId/unread')
  @ApiOperation({ summary: 'Get user unread notifications count' })
  @ApiResponse({ status: 200, description: 'Count retrieved successfully' })
  async getUnreadCount(@Param('userId') userId: string) {
    const notifications =
      await this.notificationService.getUserNotifications(userId);
    const unreadCount = notifications.filter((n) => !n.isRead).length;
    return { unreadCount };
  }

  @Delete('user/:userId')
  @ApiOperation({ summary: 'Clear all user notifications' })
  @ApiResponse({
    status: 200,
    description: 'Notifications cleared successfully',
  })
  clearUserNotifications(@Param('userId') userId: string) {
    return this.notificationService.clearAllUserNotifications(userId);
  }

  @Put('mark-as-read/:notificationId')
  @ApiOperation({ summary: 'Mark notification as read' })
  @ApiResponse({ status: 200, description: 'Notification marked as read' })
  markAsRead(@Param('notificationId') notificationId: string) {
    return this.notificationService.markAsRead(notificationId);
  }

  @Post('device-token')
  @ApiOperation({ summary: 'Add device token for push notifications' })
  @ApiResponse({ status: 201, description: 'Device token added successfully' })
  addDeviceToken(@Body() addDeviceTokenDto: AddDeviceTokenDto) {
    return this.notificationService.addDeviceToken(addDeviceTokenDto);
  }

  @Delete('device-token/:token')
  @ApiOperation({ summary: 'Remove device token' })
  @ApiResponse({
    status: 200,
    description: 'Device token removed successfully',
  })
  removeDeviceToken(@Param('token') token: string) {
    return this.notificationService.removeDeviceToken(token);
  }

  @Post('send-topic')
  @ApiOperation({ summary: 'Send notification to a topic' })
  @ApiResponse({
    status: 200,
    description: 'Topic notification sent successfully',
  })
  sendTopicNotification(
    @Body() sendTopicNotificationDto: SendTopicNotificationDto,
  ) {
    return this.notificationService.sendTopicNotification(
      sendTopicNotificationDto,
    );
  }

  @Post('subscribe-topic')
  @ApiOperation({ summary: 'Subscribe device to a topic' })
  @ApiResponse({ status: 200, description: 'Subscribed to topic successfully' })
  subscribeToTopic(@Body() subscribeToTopicDto: SubscribeToTopicDto) {
    return this.notificationService.subscribeToTopic(subscribeToTopicDto);
  }

  @Post('unsubscribe-topic')
  @ApiOperation({ summary: 'Unsubscribe device from a topic' })
  @ApiResponse({
    status: 200,
    description: 'Unsubscribed from topic successfully',
  })
  unsubscribeFromTopic(
    @Body() unsubscribeFromTopicDto: UnsubscribeFromTopicDto,
  ) {
    return this.notificationService.unsubscribeFromTopic(
      unsubscribeFromTopicDto,
    );
  }

  @Get('templates')
  @ApiOperation({ summary: 'Get all notification templates' })
  @ApiResponse({ status: 200, description: 'Templates retrieved successfully' })
  async getAllTemplates() {
    // This would need to be implemented in the service
    return { message: 'Get all templates - to be implemented' };
  }

  @Get('templates/:slug')
  @ApiOperation({ summary: 'Get notification template by slug' })
  @ApiResponse({ status: 200, description: 'Template retrieved successfully' })
  getTemplateBySlug(@Param('slug') slug: string) {
    return this.notificationService.getTemplateBySlug(slug);
  }

  @Get('stats/:userId')
  @ApiOperation({ summary: 'Get notification statistics for user' })
  @ApiResponse({
    status: 200,
    description: 'Statistics retrieved successfully',
  })
  async getNotificationStats(@Param('userId') userId: string) {
    const notifications =
      await this.notificationService.getUserNotifications(userId);
    const total = notifications.length;
    const unread = notifications.filter((n) => !n.isRead).length;
    const read = total - unread;

    return {
      total,
      unread,
      read,
      readPercentage: total > 0 ? Math.round((read / total) * 100) : 0,
    };
  }

  @Post('bulk-send')
  @ApiOperation({ summary: 'Send notifications to multiple users' })
  @ApiResponse({
    status: 200,
    description: 'Bulk notifications sent successfully',
  })
  async sendBulkNotifications(
    @Body()
    data: {
      userIds: string[];
      templateSlug: string;
      data?: Record<string, any>;
    },
  ) {
    const results: Array<{
      userId: string;
      success: boolean;
      result?: any;
      error?: string;
    }> = [];

    for (const userId of data.userIds) {
      try {
        const result =
          await this.notificationService.sendNotificationWithTemplate({
            userId,
            templateSlug: data.templateSlug,
            data: data.data,
          });
        results.push({ userId, success: true, result });
      } catch (error) {
        results.push({ userId, success: false, error: error.message });
      }
    }

    return {
      message: 'Bulk notifications processed',
      results,
      total: data.userIds.length,
      successful: results.filter((r) => r.success).length,
      failed: results.filter((r) => !r.success).length,
    };
  }
}
