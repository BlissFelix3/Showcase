import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { TypeOrmRepository } from '../../config/repository/typeorm.repository';
import { LawReport } from '../entities/law-report.entity';

@Injectable()
export class LawReportRepository extends TypeOrmRepository<LawReport> {
  constructor(private readonly dataSource: DataSource) {
    super(LawReport, dataSource.createEntityManager());
  }
}
