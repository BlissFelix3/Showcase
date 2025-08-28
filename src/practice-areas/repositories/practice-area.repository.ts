import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { TypeOrmRepository } from '../../config/repository/typeorm.repository';
import { PracticeArea } from '../entities/practice-area.entity';

@Injectable()
export class PracticeAreaRepository extends TypeOrmRepository<PracticeArea> {
  constructor(private readonly dataSource: DataSource) {
    super(PracticeArea, dataSource.createEntityManager());
  }
}
