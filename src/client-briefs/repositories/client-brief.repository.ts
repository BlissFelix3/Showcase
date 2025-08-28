import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { TypeOrmRepository } from '../../config/repository/typeorm.repository';
import { ClientBrief } from '../entities/client-brief.entity';

@Injectable()
export class ClientBriefRepository extends TypeOrmRepository<ClientBrief> {
  constructor(private readonly dataSource: DataSource) {
    super(ClientBrief, dataSource.createEntityManager());
  }
}
