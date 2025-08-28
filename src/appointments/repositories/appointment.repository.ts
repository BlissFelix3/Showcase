import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { TypeOrmRepository } from '../../config/repository/typeorm.repository';
import { Appointment } from '../entities/appointment.entity';

@Injectable()
export class AppointmentRepository extends TypeOrmRepository<Appointment> {
  constructor(private readonly dataSource: DataSource) {
    super(Appointment, dataSource.createEntityManager());
  }
}
