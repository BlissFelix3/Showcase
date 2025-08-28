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
import { AIConsultationService } from './ai-consultation.service';
import { CreateConsultationDto } from './dto/create-consultation.dto';
import { GetSession } from '../common/decorators/get-session.decorator';
import type { SessionData } from '../common/decorators/get-session.decorator';

@ApiTags('ai-consultations')
@Controller('ai-consultations')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@ApiBearerAuth()
export class AIConsultationController {
  constructor(private readonly aiConsultationService: AIConsultationService) {}

  @Post()
  @Roles(UserRole.CLIENT, UserRole.LAWYER)
  @ApiOperation({ summary: 'Create a new AI consultation' })
  @ApiResponse({
    status: 201,
    description: 'Consultation created successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createConsultation(
    @GetSession() session: SessionData,
    @Body() dto: CreateConsultationDto,
  ) {
    return this.aiConsultationService.createConsultation(session.userId, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get consultation by ID' })
  @ApiParam({ name: 'id', description: 'Consultation ID' })
  @ApiResponse({
    status: 200,
    description: 'Consultation retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Consultation not found' })
  async getConsultationById(@Param('id') id: string) {
    return this.aiConsultationService.getConsultationById(id);
  }

  @Get('client/consultations')
  @Roles(UserRole.CLIENT)
  @ApiOperation({ summary: 'Get client consultations' })
  @ApiResponse({
    status: 200,
    description: 'Consultations retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getClientConsultations(@GetSession() session: SessionData) {
    return this.aiConsultationService.getClientConsultations(session.userId);
  }

  @Post(':id/process')
  @Roles(UserRole.CLIENT)
  @ApiOperation({ summary: 'Process AI consultation after payment' })
  @ApiResponse({
    status: 200,
    description: 'Consultation processed successfully',
  })
  @ApiResponse({ status: 404, description: 'Consultation not found' })
  async processConsultation(@Param('id') id: string) {
    return this.aiConsultationService.processAIConsultation(id);
  }

  @Post(':id/status')
  @Roles(UserRole.CLIENT)
  @ApiOperation({ summary: 'Update consultation status' })
  @ApiResponse({
    status: 200,
    description: 'Consultation status updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Consultation not found' })
  async updateStatus(
    @Param('id') id: string,
    @Body() body: { status: string },
  ) {
    return this.aiConsultationService.updateConsultationStatus(
      id,
      body.status as any,
    );
  }
}
