import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { TypeOrmRepository } from '../../config/repository/typeorm.repository';
import { Complaint } from '../entities/complaint.entity';

@Injectable()
export class ComplaintRepository extends TypeOrmRepository<Complaint> {
  constructor(private readonly dataSource: DataSource) {
    super(Complaint, dataSource.createEntityManager());
  }
}
