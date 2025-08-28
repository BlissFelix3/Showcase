import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
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
import { ComplaintsService } from './complaints.service';
import { CreateComplaintDto } from './dto/create-complaint.dto';
import { GetSession } from '../common/decorators/get-session.decorator';
import type { SessionData } from '../common/decorators/get-session.decorator';
import type { ComplaintStatus } from './entities/complaint.entity';

@ApiTags('complaints')
@Controller('complaints')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@ApiBearerAuth()
export class ComplaintsController {
  constructor(private readonly complaintsService: ComplaintsService) {}

  @Post()
  @Roles(UserRole.CLIENT, UserRole.LAWYER)
  @ApiOperation({ summary: 'Create a new complaint' })
  @ApiResponse({ status: 201, description: 'Complaint created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createComplaint(
    @GetSession() session: SessionData,
    @Body() createComplaintDto: CreateComplaintDto,
  ) {
    return this.complaintsService.create(createComplaintDto, session.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get complaint by ID' })
  @ApiParam({ name: 'id', description: 'Complaint ID' })
  @ApiResponse({ status: 200, description: 'Complaint retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Complaint not found' })
  async getComplaintById(@Param('id') id: string) {
    return this.complaintsService.findOne(id);
  }

  @Put(':id/status')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update complaint status' })
  @ApiParam({ name: 'id', description: 'Complaint ID' })
  @ApiResponse({
    status: 200,
    description: 'Complaint status updated successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Complaint not found' })
  async updateComplaintStatus(
    @Param('id') id: string,
    @Body() body: { status: string },
  ) {
    return this.complaintsService.updateStatus(
      id,
      body.status as ComplaintStatus,
    );
  }

  @Get('user/me')
  @ApiOperation({ summary: 'Get current user complaints' })
  @ApiResponse({
    status: 200,
    description: 'Complaints retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findByUser(@GetSession() session: SessionData) {
    return this.complaintsService.findByUser(session.userId);
  }

  @Get('all')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all complaints (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'All complaints retrieved successfully',
  })
  async findAll() {
    return this.complaintsService.findAll();
  }

  @Post(':id/resolve')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Resolve complaint' })
  @ApiParam({ name: 'id', description: 'Complaint ID' })
  @ApiResponse({ status: 200, description: 'Complaint resolved successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Complaint not found' })
  async resolveComplaint(
    @Param('id') id: string,
    @Body() body: { resolution: string; mediatorId: string },
  ) {
    return this.complaintsService.resolve(id, body.resolution, body.mediatorId);
  }
}
