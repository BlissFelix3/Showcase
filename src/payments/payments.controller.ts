import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
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
import { PaymentsService } from './payments.service';
import { GetSession } from '../common/decorators/get-session.decorator';
import type { SessionData } from '../common/decorators/get-session.decorator';
import type { PaymentStatus } from './entities/payment.entity';

@ApiTags('payments')
@Controller('payments')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@ApiBearerAuth()
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('consultation')
  @Roles(UserRole.CLIENT)
  @ApiOperation({ summary: 'Create a consultation payment' })
  @ApiResponse({ status: 201, description: 'Payment created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createConsultationPayment(
    @GetSession() session: SessionData,
    @Body() body: { amountMinor: number },
  ) {
    return this.paymentsService.createConsultationPayment(
      session.userId,
      body.amountMinor,
    );
  }

  @Post('escrow')
  @Roles(UserRole.CLIENT)
  @ApiOperation({ summary: 'Create escrow payment' })
  @ApiResponse({
    status: 201,
    description: 'Escrow payment created successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createEscrowPayment(
    @Body()
    body: {
      caseId: string;
      amountMinor: number;
      milestoneId?: string;
      purpose: string;
      lawyerId: string;
      clientId: string;
    },
  ) {
    return this.paymentsService.createEscrowPayment(body);
  }

  @Post('escrow/:escrowId/release')
  @Roles(UserRole.LAWYER)
  @ApiOperation({ summary: 'Release escrow payment' })
  @ApiParam({ name: 'escrowId', description: 'Escrow ID' })
  @ApiResponse({
    status: 200,
    description: 'Escrow payment released successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Escrow not found' })
  async releaseEscrowPayment(
    @Param('escrowId') escrowId: string,
    @Body() body: { reason: string; amountMinor?: number },
    @GetSession() session: SessionData,
  ) {
    return this.paymentsService.releaseEscrow(
      escrowId,
      body.reason,
      session.userId,
      body.amountMinor,
    );
  }

  @Post('escrow/:escrowId/cancel')
  @ApiOperation({ summary: 'Cancel escrow payment' })
  @ApiParam({ name: 'escrowId', description: 'Escrow ID' })
  @ApiResponse({
    status: 200,
    description: 'Escrow payment cancelled successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Escrow not found' })
  async cancelEscrowPayment(
    @Param('escrowId') escrowId: string,
    @Body() body: { reason: string },
    @GetSession() session: SessionData,
  ) {
    return this.paymentsService.cancelEscrow(
      escrowId,
      body.reason,
      session.userId,
    );
  }

  @Get('escrow/:escrowId')
  @ApiOperation({ summary: 'Get escrow details' })
  @ApiParam({ name: 'escrowId', description: 'Escrow ID' })
  @ApiResponse({
    status: 200,
    description: 'Escrow details retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Escrow not found' })
  async getEscrowDetails(@Param('escrowId') escrowId: string) {
    return this.paymentsService.getEscrowDetails(escrowId);
  }

  @Get('escrow/case/:caseId')
  @ApiOperation({ summary: 'Get escrows by case' })
  @ApiParam({ name: 'caseId', description: 'Case ID' })
  @ApiResponse({ status: 200, description: 'Escrows retrieved successfully' })
  async getEscrowsByCase(@Param('caseId') caseId: string) {
    return this.paymentsService.getEscrowsByCase(caseId);
  }

  @Get('history')
  @ApiOperation({ summary: 'Get payment history' })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filter by payment status',
  })
  @ApiQuery({
    name: 'purpose',
    required: false,
    description: 'Filter by payment purpose',
  })
  @ApiQuery({
    name: 'provider',
    required: false,
    description: 'Filter by payment provider',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    description: 'Filter by start date',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    description: 'Filter by end date',
  })
  @ApiResponse({
    status: 200,
    description: 'Payment history retrieved successfully',
  })
  async getPaymentHistory(
    @GetSession() session: SessionData,
    @Query()
    filters: {
      status?: string;
      purpose?: string;
      provider?: string;
      startDate?: string;
      endDate?: string;
    },
  ) {
    const processedFilters = {
      ...filters,
      status: filters.status as PaymentStatus | undefined,
      startDate: filters.startDate ? new Date(filters.startDate) : undefined,
      endDate: filters.endDate ? new Date(filters.endDate) : undefined,
    };

    return this.paymentsService.getPaymentHistory(
      session.userId,
      processedFilters,
    );
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get payment statistics' })
  @ApiResponse({
    status: 200,
    description: 'Statistics retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getPaymentStatistics(@GetSession() session: SessionData) {
    return this.paymentsService.getPaymentStatistics(session.userId);
  }

  @Get('expiring-escrows')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get expiring escrows' })
  @ApiQuery({
    name: 'daysThreshold',
    required: false,
    description: 'Days threshold for expiring escrows',
    example: 30,
  })
  @ApiResponse({
    status: 200,
    description: 'Expiring escrows retrieved successfully',
  })
  async getExpiringEscrows(@Query('daysThreshold') daysThreshold?: string) {
    const threshold = daysThreshold ? parseInt(daysThreshold) : 30;
    return this.paymentsService.getExpiringEscrows(threshold);
  }
}
