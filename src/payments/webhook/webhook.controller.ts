import {
  Controller,
  Post,
  Req,
  Body,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import type { Request } from 'express';
import { WebhookEventsService, WebhookEvent } from './webhook-events.service';
import { PaymentsService } from '../payments.service';

interface PaystackWebhookBody {
  event: string;
  data: {
    reference: string;
    status: string;
    amount: number;
    customer: {
      email: string;
      customer_code: string;
    };
    metadata?: {
      caseId?: string;
      milestoneId?: string;
      purpose?: string;
    };
    [key: string]: unknown;
  };
}

interface EscrowWebhookBody {
  event: string;
  data: {
    escrowId: string;
    status: string;
    amount: number;
    caseId: string;
  };
}

@ApiTags('webhooks')
@Controller('webhooks')
export class WebhookController {
  constructor(
    private readonly webhookEventsService: WebhookEventsService,
    private readonly paymentsService: PaymentsService,
  ) {}

  @Post('paystack')
  @ApiOperation({ summary: 'Paystack webhook endpoint' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        event: { type: 'string', example: 'charge.success' },
        data: {
          type: 'object',
          properties: {
            reference: { type: 'string', example: 'ref_123456789' },
            status: { type: 'string', example: 'success' },
            amount: { type: 'number', example: 50000 },
            customer: {
              type: 'object',
              properties: {
                email: { type: 'string', example: 'user@example.com' },
                customer_code: { type: 'string', example: 'CUS_123456' },
              },
            },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Webhook processed successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Invalid signature' })
  async paystackWebhook(
    @Req() req: Request,
    @Body() body: PaystackWebhookBody,
  ) {
    const signature = req.headers['x-paystack-signature'] as string;
    if (!signature) {
      throw new BadRequestException('Missing Paystack signature');
    }

    const payload = JSON.stringify(body);
    const isValid = this.paymentsService.validateWebhookSignature(
      payload,
      signature,
    );

    if (!isValid) {
      throw new UnauthorizedException('Invalid Paystack signature');
    }

    const result = await this.webhookEventsService.processWebhookEvent(
      body as WebhookEvent,
    );

    return {
      success: true,
      event: body.event,
      processed: result.processed,
      result: result.result as Record<string, unknown>,
      timestamp: new Date().toISOString(),
    };
  }

  @Post('escrow')
  @ApiOperation({ summary: 'Escrow webhook endpoint' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        event: { type: 'string', example: 'escrow.released' },
        data: {
          type: 'object',
          properties: {
            escrowId: { type: 'string', example: 'escrow_123456' },
            status: { type: 'string', example: 'released' },
            amount: { type: 'number', example: 100000 },
            caseId: { type: 'string', example: 'case_123456' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Webhook processed successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  escrowWebhook(@Req() req: Request, @Body() body: EscrowWebhookBody) {
    return {
      success: true,
      event: body.event,
      message: 'Escrow webhook received',
      timestamp: new Date().toISOString(),
    };
  }

  @Post('test')
  @ApiOperation({ summary: 'Test webhook endpoint for development' })
  @ApiResponse({ status: 200, description: 'Test webhook processed' })
  testWebhook(@Body() body: Record<string, unknown>) {
    return {
      success: true,
      message: 'Test webhook processed successfully',
      receivedData: body,
      timestamp: new Date().toISOString(),
    };
  }
}
