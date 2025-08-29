import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from './enums/user-role.enum';
import { RolesGuard } from '../auth/roles.guard';
import { LawyerProfileService } from './lawyer-profile.service';
import { UpdateLawyerProfileDto } from './dto/update-lawyer-profile.dto';
import { UploadDocumentDto } from './dto/upload-document.dto';
import { CreateReviewDto } from './dto/create-review.dto';
import { VerifyLawyerDto } from './dto/verify-lawyer.dto';
import { GetSession } from '../common/decorators/get-session.decorator';
import type { SessionData } from '../common/decorators/get-session.decorator';
import { multerConfig } from '../config/multer.config';

@ApiTags('lawyer-profiles')
@Controller('lawyer-profiles')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@ApiBearerAuth()
export class LawyerProfileController {
  constructor(private readonly lawyerProfileService: LawyerProfileService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get lawyer profile by ID (public)' })
  @ApiParam({ name: 'id', description: 'Lawyer profile ID' })
  @ApiResponse({
    status: 200,
    description: 'Lawyer profile retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Lawyer profile not found' })
  async getPublicLawyerProfile(@Param('id') id: string) {
    return this.lawyerProfileService.getPublicLawyerProfile(id);
  }

  @Get(':id/private')
  @Roles(UserRole.LAWYER)
  @ApiOperation({ summary: 'Get private lawyer profile (lawyer only)' })
  @ApiParam({ name: 'id', description: 'Lawyer profile ID' })
  @ApiResponse({
    status: 200,
    description: 'Lawyer profile retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Lawyer profile not found' })
  async getPrivateLawyerProfile(
    @Param('id') id: string,
    @GetSession() session: SessionData,
  ) {
    if (session.userId !== id) {
      throw new Error('You can only access your own profile');
    }
    return this.lawyerProfileService.getLawyerProfile(id);
  }

  @Put(':id')
  @Roles(UserRole.LAWYER)
  @ApiOperation({ summary: 'Update lawyer profile' })
  @ApiParam({ name: 'id', description: 'Lawyer profile ID' })
  @ApiResponse({
    status: 200,
    description: 'Lawyer profile updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Lawyer profile not found' })
  async updateLawyerProfile(
    @Param('id') id: string,
    @Body() updateData: UpdateLawyerProfileDto,
    @GetSession() session: SessionData,
  ) {
    if (session.userId !== id) {
      throw new Error('You can only update your own profile');
    }
    return this.lawyerProfileService.updateLawyerProfile(id, updateData);
  }

  @Post(':id/documents')
  @Roles(UserRole.LAWYER)
  @ApiOperation({ summary: 'Upload verification document' })
  @ApiParam({ name: 'id', description: 'Lawyer profile ID' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Document upload with metadata',
    type: UploadDocumentDto,
  })
  @ApiResponse({
    status: 201,
    description: 'Document uploaded successfully',
  })
  @UseInterceptors(FileInterceptor('file', multerConfig))
  async uploadDocument(
    @Param('id') id: string,
    @Body() uploadData: UploadDocumentDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: '.(pdf|jpg|jpeg|png)' }),
        ],
      }),
    )
    file: any,
    @GetSession() session: SessionData,
  ) {
    if (session.userId !== id) {
      throw new Error('You can only upload documents to your own profile');
    }
    return this.lawyerProfileService.uploadVerificationDocument(
      id,
      uploadData,
      file,
    );
  }

  @Get(':id/documents')
  @Roles(UserRole.LAWYER)
  @ApiOperation({ summary: 'Get verification documents' })
  @ApiParam({ name: 'id', description: 'Lawyer profile ID' })
  @ApiResponse({
    status: 200,
    description: 'Documents retrieved successfully',
  })
  async getVerificationDocuments(
    @Param('id') id: string,
    @GetSession() session: SessionData,
  ) {
    if (session.userId !== id) {
      throw new Error('You can only access your own documents');
    }
    return this.lawyerProfileService.getVerificationDocuments(id);
  }

  @Post(':id/reviews')
  @Roles(UserRole.CLIENT)
  @ApiOperation({ summary: 'Create lawyer review' })
  @ApiParam({ name: 'id', description: 'Lawyer profile ID' })
  @ApiResponse({
    status: 201,
    description: 'Review created successfully',
  })
  async createReview(
    @Param('id') id: string,
    @Body() reviewData: CreateReviewDto,
    @GetSession() session: SessionData,
  ) {
    return this.lawyerProfileService.createReview(
      session.userId,
      id,
      reviewData,
    );
  }

  @Get(':id/reviews')
  @ApiOperation({ summary: 'Get lawyer reviews' })
  @ApiParam({ name: 'id', description: 'Lawyer profile ID' })
  @ApiQuery({ name: 'page', description: 'Page number', required: false })
  @ApiQuery({ name: 'limit', description: 'Items per page', required: false })
  @ApiResponse({
    status: 200,
    description: 'Reviews retrieved successfully',
  })
  async getLawyerReviews(
    @Param('id') id: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.lawyerProfileService.getLawyerReviews(
      id,
      parseInt(page.toString()),
      parseInt(limit.toString()),
    );
  }

  @Get(':id/stats')
  @ApiOperation({ summary: 'Get lawyer statistics' })
  @ApiParam({ name: 'id', description: 'Lawyer profile ID' })
  @ApiResponse({
    status: 200,
    description: 'Statistics retrieved successfully',
  })
  async getLawyerStats(@Param('id') id: string) {
    return this.lawyerProfileService.getLawyerStats(id);
  }

  @Get(':id/practice-areas')
  @ApiOperation({ summary: 'Get lawyer practice areas' })
  @ApiParam({ name: 'id', description: 'Lawyer profile ID' })
  @ApiResponse({
    status: 200,
    description: 'Practice areas retrieved successfully',
  })
  async getLawyerPracticeAreas(@Param('id') id: string) {
    return this.lawyerProfileService.getLawyerPracticeAreas(id);
  }

  @Post(':id/practice-areas')
  @Roles(UserRole.LAWYER)
  @ApiOperation({ summary: 'Assign practice areas to lawyer' })
  @ApiParam({ name: 'id', description: 'Lawyer profile ID' })
  @ApiResponse({
    status: 200,
    description: 'Practice areas assigned successfully',
  })
  async assignPracticeAreas(
    @Param('id') id: string,
    @Body() body: { practiceAreaIds: string[] },
    @GetSession() session: SessionData,
  ) {
    if (session.userId !== id) {
      throw new Error('You can only assign practice areas to your own profile');
    }
    return this.lawyerProfileService.assignPracticeAreasToLawyer(
      id,
      body.practiceAreaIds,
    );
  }

  @Delete(':id/practice-areas/:practiceAreaId')
  @Roles(UserRole.LAWYER)
  @ApiOperation({ summary: 'Remove practice area from lawyer' })
  @ApiParam({ name: 'id', description: 'Lawyer profile ID' })
  @ApiParam({ name: 'practiceAreaId', description: 'Practice area ID' })
  @ApiResponse({
    status: 200,
    description: 'Practice area removed successfully',
  })
  async removePracticeArea(
    @Param('id') id: string,
    @Param('practiceAreaId') practiceAreaId: string,
    @GetSession() session: SessionData,
  ) {
    if (session.userId !== id) {
      throw new Error(
        'You can only remove practice areas from your own profile',
      );
    }
    return this.lawyerProfileService.removePracticeAreaFromLawyer(
      id,
      practiceAreaId,
    );
  }

  @Get('verification/queue')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get verification queue (admin only)' })
  @ApiQuery({ name: 'page', description: 'Page number', required: false })
  @ApiQuery({ name: 'limit', description: 'Items per page', required: false })
  @ApiResponse({
    status: 200,
    description: 'Verification queue retrieved successfully',
  })
  async getVerificationQueue(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.lawyerProfileService.getVerificationQueue(
      parseInt(page.toString()),
      parseInt(limit.toString()),
    );
  }

  @Post(':id/verify')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Verify lawyer profile (admin only)' })
  @ApiParam({ name: 'id', description: 'Lawyer profile ID' })
  @ApiResponse({
    status: 200,
    description: 'Lawyer verification status updated successfully',
  })
  async verifyLawyer(
    @Param('id') id: string,
    @Body() verificationData: VerifyLawyerDto,
    @GetSession() session: SessionData,
  ) {
    return this.lawyerProfileService.verifyLawyer(
      id,
      session.userId,
      verificationData,
    );
  }

  @Get('matching/search')
  @ApiOperation({ summary: 'Search for lawyers for matching' })
  @ApiQuery({ name: 'jurisdiction', description: 'Legal jurisdiction' })
  @ApiQuery({ name: 'practiceArea', description: 'Practice area' })
  @ApiQuery({
    name: 'latitude',
    description: 'Client latitude',
    required: false,
  })
  @ApiQuery({
    name: 'longitude',
    description: 'Client longitude',
    required: false,
  })
  @ApiQuery({ name: 'limit', description: 'Maximum results', required: false })
  @ApiResponse({
    status: 200,
    description: 'Lawyers found successfully',
  })
  async searchLawyers(
    @Query('jurisdiction') jurisdiction: string,
    @Query('practiceArea') practiceArea: string,
    @Query('latitude') latitude?: string,
    @Query('longitude') longitude?: string,
    @Query('limit') limit = 10,
  ) {
    const clientLocation =
      latitude && longitude
        ? {
            latitude: parseFloat(latitude),
            longitude: parseFloat(longitude),
          }
        : undefined;

    return this.lawyerProfileService.getLawyersForMatching(
      jurisdiction,
      practiceArea,
      clientLocation,
      parseInt(limit.toString()),
    );
  }

  @Get('verification/stats')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get verification statistics (admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Verification statistics retrieved successfully',
  })
  async getVerificationStats() {
    return {
      totalPending: 0,
      totalApproved: 0,
      totalRejected: 0,
      averageProcessingTime: 0,
    };
  }
}
