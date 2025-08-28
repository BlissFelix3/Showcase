import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../users/enums/user-role.enum';
import { RolesGuard } from '../auth/roles.guard';
import { ChatService } from './chat.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { GetSession } from '../common/decorators/get-session.decorator';
import type { SessionData } from '../common/decorators/get-session.decorator';

@ApiTags('chat')
@Controller('chat')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@ApiBearerAuth()
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('message')
  @ApiOperation({ summary: 'Send a new message' })
  @ApiResponse({ status: 201, description: 'Message sent successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async sendMessage(
    @Body() createMessageDto: CreateMessageDto,
    @GetSession() session: SessionData,
  ) {
    return this.chatService.sendMessage(createMessageDto, session.userId);
  }

  @Get('conversation/:userId')
  @ApiOperation({ summary: 'Get conversation with a user' })
  @ApiParam({ name: 'userId', description: 'User ID to get conversation with' })
  @ApiResponse({
    status: 200,
    description: 'Conversation retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getConversation(
    @Param('userId') otherUserId: string,
    @Query('caseId') caseId: string | undefined,
    @GetSession() session: SessionData,
  ) {
    return this.chatService.getConversation(
      session.userId,
      otherUserId,
      caseId,
    );
  }

  @Get('case/:caseId')
  @ApiOperation({ summary: 'Get case messages' })
  @ApiParam({ name: 'caseId', description: 'Case ID' })
  @ApiResponse({
    status: 200,
    description: 'Case messages retrieved successfully',
  })
  async getCaseMessages(@Param('caseId') caseId: string) {
    return this.chatService.getCaseMessages(caseId);
  }

  @Get('messages')
  @ApiOperation({ summary: 'Get user messages' })
  @ApiResponse({ status: 200, description: 'Messages retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getUserMessages(@GetSession() session: SessionData) {
    return this.chatService.getUserMessages(session.userId);
  }

  @Post('message/:messageId/read')
  @ApiOperation({ summary: 'Mark message as read' })
  @ApiParam({ name: 'messageId', description: 'Message ID' })
  @ApiResponse({ status: 200, description: 'Message marked as read' })
  @ApiResponse({ status: 404, description: 'Message not found' })
  async markAsRead(
    @Param('messageId') messageId: string,
    @GetSession() session: SessionData,
  ) {
    return this.chatService.markAsRead(messageId, session.userId);
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get unread message count' })
  @ApiResponse({ status: 200, description: 'Unread count retrieved' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getUnreadCount(@GetSession() session: SessionData) {
    return this.chatService.getUnreadCount(session.userId);
  }

  @Post('legal-consultation')
  @Roles(UserRole.CLIENT)
  @ApiOperation({ summary: 'Get AI legal consultation' })
  @ApiResponse({ status: 200, description: 'Legal consultation provided' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getLegalConsultation(
    @GetSession() session: SessionData,
    @Body() body: { question: string; caseId?: string },
  ) {
    return this.chatService.getLegalConsultation(
      session.userId,
      body.question,
      body.caseId,
    );
  }

  @Get('search')
  @ApiOperation({ summary: 'Search messages' })
  @ApiQuery({ name: 'query', description: 'Search query', required: false })
  @ApiQuery({ name: 'caseId', description: 'Case ID filter', required: false })
  @ApiResponse({ status: 200, description: 'Search results' })
  async searchMessages(
    @GetSession() session: SessionData,
    @Query('query') query: string,
    @Query('caseId') caseId?: string,
  ) {
    return this.chatService.searchMessages(session.userId, query, caseId);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get message statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getMessageStats(@GetSession() session: SessionData) {
    return this.chatService.getMessageStats(session.userId);
  }
}
