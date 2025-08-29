import {
  Body,
  Controller,
  Param,
  Post,
  Get,
  Query,
  Req,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../auth/roles.decorator';
import { VerificationService } from './verification.service';

export class SubmitVerificationDto {
  callToBarCertificateUrl: string;
  nationalIdNumber: string;
  additionalDocuments?: Array<{
    type: string;
    url: string;
    description: string;
  }>;
}

export class ReviewVerificationDto {
  approve: boolean;
  reviewNotes?: string;
  requiredActions?: string[];
}

export class RequestAdditionalDocumentsDto {
  requiredDocuments: Array<{
    type: string;
    description: string;
    deadline?: Date;
  }>;
  notes?: string;
}

@Controller('verification')
export class VerificationController {
  constructor(private readonly verificationService: VerificationService) {}

  @UseGuards(AuthGuard('jwt'))
  @Roles('LAWYER')
  @Post('submit')
  submit(@Req() req: any, @Body() body: SubmitVerificationDto) {
    return this.verificationService.submitDocuments(req.user.userId, body);
  }

  @UseGuards(AuthGuard('jwt'))
  @Roles('ADMIN')
  @Post('review/:lawyerProfileId')
  review(
    @Param('lawyerProfileId') id: string,
    @Body() body: ReviewVerificationDto,
    @Req() req: any,
  ) {
    if (!req.user?.userId) {
      throw new BadRequestException('Admin user ID required');
    }
    return this.verificationService.review(
      id,
      body.approve,
      req.user.userId,
      body.reviewNotes,
      body.requiredActions,
    );
  }

  @UseGuards(AuthGuard('jwt'))
  @Roles('ADMIN')
  @Post('request-documents/:lawyerProfileId')
  requestAdditionalDocuments(
    @Param('lawyerProfileId') id: string,
    @Body() body: RequestAdditionalDocumentsDto,
    @Req() req: any,
  ) {
    if (!req.user?.userId) {
      throw new BadRequestException('Admin user ID required');
    }
    return this.verificationService.requestAdditionalDocuments(
      id,
      req.user.userId,
      body.requiredDocuments,
      body.notes,
    );
  }

  @UseGuards(AuthGuard('jwt'))
  @Roles('ADMIN')
  @Get('queue')
  getVerificationQueue(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
  ) {
    return this.verificationService.getVerificationQueue(
      parseInt(page, 10),
      parseInt(limit, 10),
    );
  }

  @UseGuards(AuthGuard('jwt'))
  @Roles('ADMIN')
  @Get('stats')
  getVerificationStats() {
    return this.verificationService.getVerificationStats();
  }

  @UseGuards(AuthGuard('jwt'))
  @Roles('ADMIN')
  @Get('validate/:lawyerProfileId')
  validateDocuments(@Param('lawyerProfileId') id: string) {
    return this.verificationService.validateVerificationDocuments(id);
  }
}
