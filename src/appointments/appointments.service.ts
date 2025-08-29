import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AppointmentRepository } from './repositories/appointment.repository';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import {
  AppointmentStatus,
  AppointmentType,
} from './entities/appointment.entity';
import { NotificationService } from '../notifications/notification.service';
import { LocalEvents } from '../utils/constants';

@Injectable()
export class AppointmentsService {
  constructor(
    private readonly appointmentRepository: AppointmentRepository,
    private readonly notificationService: NotificationService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(createAppointmentDto: CreateAppointmentDto) {
    // Check for scheduling conflicts
    const conflictingAppointment = await this.appointmentRepository.findOne({
      where: {
        lawyerId: createAppointmentDto.lawyerId,
        scheduledAt: new Date(createAppointmentDto.scheduledAt),
        status: AppointmentStatus.SCHEDULED,
      },
    });

    if (conflictingAppointment) {
      throw new ConflictException(
        'Lawyer has a conflicting appointment at this time',
      );
    }

    const appointment = this.appointmentRepository.create({
      ...createAppointmentDto,
      scheduledAt: new Date(createAppointmentDto.scheduledAt),
      status: AppointmentStatus.SCHEDULED,
    });

    const savedAppointment = await this.appointmentRepository.save(appointment);

    // Send notifications
    await this.sendAppointmentNotifications(savedAppointment);

    // Emit appointment scheduled event for notifications
    this.eventEmitter.emit(LocalEvents.APPOINTMENT_SCHEDULED, {
      userId: savedAppointment.clientId,
      slug: 'appointment-scheduled',
      appointment: savedAppointment,
    });

    return savedAppointment;
  }

  async confirm(appointmentId: string, userId: string) {
    const appointment = await this.appointmentRepository.findOne({
      where: { id: appointmentId },
      relations: ['lawyer', 'client'],
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    if (appointment.lawyerId !== userId && appointment.clientId !== userId) {
      throw new BadRequestException(
        'You can only confirm your own appointments',
      );
    }

    appointment.status = AppointmentStatus.CONFIRMED;
    const savedAppointment = await this.appointmentRepository.save(appointment);

    // Emit appointment confirmed event for notifications
    this.eventEmitter.emit(LocalEvents.APPOINTMENT_CONFIRMED, {
      userId: savedAppointment.clientId,
      slug: 'appointment-confirmed',
      appointment: savedAppointment,
    });

    return savedAppointment;
  }

  async cancel(appointmentId: string, userId: string, reason: string) {
    const appointment = await this.appointmentRepository.findOne({
      where: { id: appointmentId },
      relations: ['lawyer', 'client'],
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    if (appointment.lawyerId !== userId && appointment.clientId !== userId) {
      throw new BadRequestException(
        'You can only cancel your own appointments',
      );
    }

    if (
      appointment.status !== AppointmentStatus.SCHEDULED &&
      appointment.status !== AppointmentStatus.CONFIRMED
    ) {
      throw new BadRequestException(
        'Cannot cancel appointment in current status',
      );
    }

    appointment.status = AppointmentStatus.CANCELLED;
    appointment.cancellationReason = reason;
    const savedAppointment = await this.appointmentRepository.save(appointment);

    // Emit appointment cancelled event for notifications
    this.eventEmitter.emit(LocalEvents.APPOINTMENT_CANCELLED, {
      userId: savedAppointment.clientId,
      slug: 'appointment-cancelled',
      appointment: savedAppointment,
    });

    return savedAppointment;
  }

  async complete(appointmentId: string, userId: string) {
    const appointment = await this.appointmentRepository.findOne({
      where: { id: appointmentId },
      relations: ['lawyer', 'client'],
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    if (appointment.lawyerId !== userId) {
      throw new BadRequestException(
        'Only lawyers can mark appointments as completed',
      );
    }

    appointment.status = AppointmentStatus.COMPLETED;
    return this.appointmentRepository.save(appointment);
  }

  async getLawyerAppointments(lawyerId: string, status?: AppointmentStatus) {
    const where: any = { lawyerId };
    if (status) {
      where.status = status;
    }

    return this.appointmentRepository.find({
      where,
      relations: ['client', 'caseEntity'],
      order: { scheduledAt: 'ASC' },
    });
  }

  async getClientAppointments(clientId: string, status?: AppointmentStatus) {
    const where: any = { clientId };
    if (status) {
      where.status = status;
    }

    return this.appointmentRepository.find({
      where,
      relations: ['lawyer', 'caseEntity'],
      order: { scheduledAt: 'ASC' },
    });
  }

  async getAppointmentById(id: string) {
    const appointment = await this.appointmentRepository.findOne({
      where: { id },
      relations: ['lawyer', 'client', 'caseEntity'],
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    return appointment;
  }

  private async sendAppointmentNotifications(appointment: any) {
    try {
      // Send notification to lawyer
      await this.notificationService.createNotification({
        userId: appointment.lawyerId,
        title: 'New Appointment Scheduled',
        message: `You have a new appointment scheduled for ${new Date(appointment.scheduledAt).toLocaleDateString()}`,
      });

      // Send notification to client
      await this.notificationService.createNotification({
        userId: appointment.clientId,
        title: 'Appointment Confirmed',
        message: `Your appointment has been scheduled for ${new Date(appointment.scheduledAt).toLocaleDateString()}`,
      });
    } catch (error) {
      // Log error but don't fail the appointment creation
      console.error('Failed to send appointment notifications:', error);
    }
  }
}
