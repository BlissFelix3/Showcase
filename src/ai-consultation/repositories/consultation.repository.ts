import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { TypeOrmRepository } from '../../config/repository/typeorm.repository';
import { AIConsultation } from '../entities/consultation.entity';

@Injectable()
export class ConsultationRepository extends TypeOrmRepository<AIConsultation> {
  constructor(private readonly dataSource: DataSource) {
    super(AIConsultation, dataSource.createEntityManager());
  }
}
