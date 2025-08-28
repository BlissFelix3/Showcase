import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { TypeOrmRepository } from '../../config/repository/typeorm.repository';
import { Jurisdiction } from '../entities/jurisdiction.entity';

@Injectable()
export class JurisdictionRepository extends TypeOrmRepository<Jurisdiction> {
  constructor(private readonly dataSource: DataSource) {
    super(Jurisdiction, dataSource.createEntityManager());
  }
}
