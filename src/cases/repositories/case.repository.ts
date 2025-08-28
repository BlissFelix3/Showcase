import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { TypeOrmRepository } from '../../config/repository/typeorm.repository';
import { CaseEntity } from '../entities/case.entity';

@Injectable()
export class CaseRepository extends TypeOrmRepository<CaseEntity> {
  constructor(private readonly dataSource: DataSource) {
    super(CaseEntity, dataSource.createEntityManager());
  }
}
