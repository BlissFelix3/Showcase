import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../users/enums/user-role.enum';
import { AppointmentStatus } from './entities/appointment.entity';
import { GetSession } from '../common/decorators/get-session.decorator';
import type { SessionData } from '../common/decorators/get-session.decorator';

@ApiTags('appointments')
@Controller('appointments')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new appointment' })
  @ApiResponse({ status: 201, description: 'Appointment created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 409, description: 'Scheduling conflict' })
  async create(
    @Body() createAppointmentDto: CreateAppointmentDto,
    @GetSession() session: SessionData,
  ) {
    if (session.userId !== createAppointmentDto.clientId) {
      throw new BadRequestException(
        'You can only create appointments for yourself',
      );
    }
    return this.appointmentsService.create(createAppointmentDto);
  }

  @Post(':id/confirm')
  @ApiOperation({ summary: 'Confirm an appointment' })
  @ApiResponse({ status: 200, description: 'Appointment confirmed' })
  @ApiResponse({ status: 404, description: 'Appointment not found' })
  async confirm(@Param('id') id: string, @GetSession() session: SessionData) {
    return this.appointmentsService.confirm(id, session.userId);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel an appointment' })
  @ApiResponse({ status: 200, description: 'Appointment cancelled' })
  @ApiResponse({ status: 404, description: 'Appointment not found' })
  async cancel(
    @Param('id') id: string,
    @Body() body: { reason: string },
    @GetSession() session: SessionData,
  ) {
    return this.appointmentsService.cancel(id, session.userId, body.reason);
  }

  @Post(':id/complete')
  @ApiOperation({ summary: 'Mark appointment as completed' })
  @ApiResponse({ status: 200, description: 'Appointment completed' })
  @ApiResponse({ status: 404, description: 'Appointment not found' })
  @Roles(UserRole.LAWYER)
  async complete(@Param('id') id: string, @GetSession() session: SessionData) {
    return this.appointmentsService.complete(id, session.userId);
  }

  @Get('lawyer')
  @ApiOperation({ summary: 'Get lawyer appointments' })
  @ApiResponse({
    status: 200,
    description: 'Appointments retrieved successfully',
  })
  @Roles(UserRole.LAWYER)
  async getLawyerAppointments(
    @GetSession() session: SessionData,
    @Query('status') status?: string,
  ) {
    return this.appointmentsService.getLawyerAppointments(
      session.userId,
      status as AppointmentStatus,
    );
  }

  @Get('client')
  @ApiOperation({ summary: 'Get client appointments' })
  @ApiResponse({
    status: 200,
    description: 'Appointments retrieved successfully',
  })
  @Roles(UserRole.CLIENT)
  async getClientAppointments(
    @GetSession() session: SessionData,
    @Query('status') status?: string,
  ) {
    return this.appointmentsService.getClientAppointments(
      session.userId,
      status as AppointmentStatus,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get appointment by ID' })
  @ApiResponse({
    status: 200,
    description: 'Appointment retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Appointment not found' })
  async getAppointmentById(@Param('id') id: string) {
    return this.appointmentsService.getAppointmentById(id);
  }
}
