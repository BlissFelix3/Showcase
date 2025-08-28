import { Body, Controller, Param, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../auth/roles.decorator';
import { VerificationService } from './verification.service';

@Controller('verification')
export class VerificationController {
  constructor(private readonly verificationService: VerificationService) {}

  @UseGuards(AuthGuard('jwt'))
  @Roles('LAWYER')
  @Post('submit')
  submit(
    @Req() req: any,
    @Body() body: { callToBarCertificateUrl: string; nationalIdNumber: string },
  ) {
    return this.verificationService.submitDocuments(req.user.userId, body);
  }

  @UseGuards(AuthGuard('jwt'))
  @Roles('ADMIN')
  @Post('review/:lawyerProfileId')
  review(
    @Param('lawyerProfileId') id: string,
    @Body() body: { approve: boolean },
  ) {
    return this.verificationService.review(id, body.approve);
  }
}
