import {
  Body,
  Controller,
  Get,
  Param,
  Post,
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
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../users/enums/user-role.enum';
import { RolesGuard } from '../auth/roles.guard';
import { RatingsService } from './ratings.service';
import { CreateRatingDto } from './dto/create-rating.dto';
import { GetSession } from '../common/decorators/get-session.decorator';
import type { SessionData } from '../common/decorators/get-session.decorator';

@ApiTags('ratings')
@Controller('ratings')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@ApiBearerAuth()
export class RatingsController {
  constructor(private readonly ratingsService: RatingsService) {}

  @Post()
  @Roles(UserRole.CLIENT)
  @ApiOperation({ summary: 'Create a new rating' })
  @ApiResponse({ status: 201, description: 'Rating created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createRating(
    @GetSession() session: SessionData,
    @Body() createRatingDto: CreateRatingDto,
  ) {
    return this.ratingsService.create(createRatingDto, session.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get rating by ID' })
  @ApiParam({ name: 'id', description: 'Rating ID' })
  @ApiResponse({ status: 200, description: 'Rating retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Rating not found' })
  async getRatingById(@Param('id') id: string) {
    return this.ratingsService.findOne(id);
  }

  @Get('lawyer/:lawyerId')
  @ApiOperation({ summary: 'Get ratings for a lawyer' })
  @ApiParam({ name: 'lawyerId', description: 'Lawyer ID' })
  @ApiResponse({ status: 200, description: 'Ratings retrieved successfully' })
  async getLawyerRatings(@Param('lawyerId') lawyerId: string) {
    return this.ratingsService.findByLawyer(lawyerId);
  }

  @Get('case/:caseId')
  @ApiOperation({ summary: 'Get ratings for a case' })
  @ApiParam({ name: 'caseId', description: 'Case ID' })
  @ApiResponse({ status: 200, description: 'Ratings retrieved successfully' })
  async getCaseRatings(@Param('caseId') caseId: string) {
    return this.ratingsService.findByCase(caseId);
  }
}
