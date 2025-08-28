import { Injectable } from '@nestjs/common';
import { TypeOrmRepository } from 'src/config/repository/typeorm.repository';
import { LawyerProfile } from '../entities/lawyer-profile.entity';
import { DataSource } from 'typeorm';

@Injectable()
export class LawyerProfileRepository extends TypeOrmRepository<LawyerProfile> {
  constructor(private readonly dataSource: DataSource) {
    super(LawyerProfile, dataSource.createEntityManager());
  }
}
