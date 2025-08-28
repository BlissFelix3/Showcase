import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { TypeOrmRepository } from '../../config/repository/typeorm.repository';
import { Milestone } from '../entities/milestone.entity';

@Injectable()
export class MilestoneRepository extends TypeOrmRepository<Milestone> {
  constructor(private readonly dataSource: DataSource) {
    super(Milestone, dataSource.createEntityManager());
  }
}
