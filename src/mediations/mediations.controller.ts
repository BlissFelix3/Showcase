import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { MediationsService } from './mediations.service';

import type { AuthenticatedRequest, Mediation } from '../common/interfaces';

@ApiTags('mediations')
@Controller('mediations')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@ApiBearerAuth()
export class MediationsController {
  constructor(private readonly mediationsService: MediationsService) {}

  @Post('initiate')
  @Roles('CLIENT', 'LAWYER')
  @ApiOperation({ summary: 'Initiate a mediation process' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        caseId: {
          type: 'string',
          example: 'uuid',
          description: 'Case ID for mediation',
        },
        mediatorId: {
          type: 'string',
          example: 'uuid',
          description: 'Mediator ID',
        },
        reason: {
          type: 'string',
          example: 'Dispute resolution attempt',
          description: 'Reason for mediation',
        },
      },
      required: ['caseId', 'mediatorId', 'reason'],
    },
  })
  @ApiResponse({ status: 201, description: 'Mediation initiated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  initiate(
    @Req() req: AuthenticatedRequest,
    @Body() body: { caseId: string; mediatorId: string; reason: string },
  ): Mediation {
    return this.mediationsService.initiate(
      req.user.userId,
      body.caseId,
      body.mediatorId,
      body.reason,
    );
  }

  @Get('case/:caseId')
  @Roles('CLIENT', 'LAWYER', 'ADMIN')
  @ApiOperation({ summary: 'Get mediation details for a case' })
  @ApiParam({ name: 'caseId', description: 'Case ID' })
  @ApiResponse({ status: 200, description: 'Mediation details retrieved' })
  @ApiResponse({ status: 404, description: 'Mediation not found' })
  getByCase(@Param('caseId') caseId: string): Mediation | null {
    return this.mediationsService.getByCase(caseId);
  }

  @Put(':mediationId/status')
  @Roles('MEDIATOR', 'ADMIN')
  @ApiOperation({ summary: 'Update mediation status' })
  @ApiParam({ name: 'mediationId', description: 'Mediation ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'FAILED'],
          example: 'IN_PROGRESS',
        },
        notes: { type: 'string', example: 'Mediation session notes' },
      },
      required: ['status'],
    },
  })
  @ApiResponse({ status: 200, description: 'Status updated successfully' })
  @ApiResponse({ status: 404, description: 'Mediation not found' })
  updateStatus(
    @Param('mediationId') mediationId: string,
    @Body() body: { status: string; notes?: string },
  ): Mediation {
    return this.mediationsService.updateStatus(
      mediationId,
      body.status,
      body.notes,
    );
  }

  @Post(':mediationId/schedule')
  @Roles('MEDIATOR')
  @ApiOperation({ summary: 'Schedule mediation session' })
  @ApiParam({ name: 'mediationId', description: 'Mediation ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        scheduledDate: {
          type: 'string',
          format: 'date-time',
          example: '2024-12-25T10:00:00Z',
        },
        location: { type: 'string', example: 'Virtual Meeting' },
        notes: { type: 'string', example: 'Please prepare your case summary' },
      },
      required: ['scheduledDate', 'location'],
    },
  })
  @ApiResponse({ status: 200, description: 'Session scheduled successfully' })
  @ApiResponse({ status: 404, description: 'Mediation not found' })
  scheduleSession(
    @Param('mediationId') mediationId: string,
    @Body() body: { scheduledDate: string; location: string; notes?: string },
  ): Mediation {
    return this.mediationsService.scheduleSession(
      mediationId,
      body.scheduledDate,
      body.location,
      body.notes,
    );
  }

  @Get('user/:userId')
  @Roles('CLIENT', 'LAWYER')
  @ApiOperation({ summary: "Get user's mediations" })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filter by status',
  })
  @ApiResponse({
    status: 200,
    description: 'Mediations retrieved successfully',
  })
  getUserMediations(
    @Param('userId') userId: string,
    @Query('status') status?: string,
  ): Mediation[] {
    return this.mediationsService.getUserMediations(userId, status);
  }
}
