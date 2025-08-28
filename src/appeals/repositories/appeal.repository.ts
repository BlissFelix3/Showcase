import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { TypeOrmRepository } from '../../config/repository/typeorm.repository';
import { Appeal } from '../entities/appeal.entity';

@Injectable()
export class AppealRepository extends TypeOrmRepository<Appeal> {
  constructor(private readonly dataSource: DataSource) {
    super(Appeal, dataSource.createEntityManager());
  }
}
