import { Module } from '@nestjs/common';
import { AppointmentsController } from './appointments.controller';
import { AppointmentsService } from './appointments.service';
import { AppointmentRepository } from './repositories/appointment.repository';
import { NotificationsModule } from '../notifications/notification.module';

@Module({
  imports: [NotificationsModule],
  controllers: [AppointmentsController],
  providers: [AppointmentsService, AppointmentRepository],
  exports: [AppointmentsService],
})
export class AppointmentsModule {}
