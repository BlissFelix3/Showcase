import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { TypeOrmRepository } from '../../config/repository/typeorm.repository';
import { Proposal } from '../entities/proposal.entity';

@Injectable()
export class ProposalRepository extends TypeOrmRepository<Proposal> {
  constructor(private readonly dataSource: DataSource) {
    super(Proposal, dataSource.createEntityManager());
  }
}
