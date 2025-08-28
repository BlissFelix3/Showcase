import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { TypeOrmRepository } from '../../config/repository/typeorm.repository';
import { ClientProfile } from '../entities/client-profile.entity';

@Injectable()
export class ClientProfileRepository extends TypeOrmRepository<ClientProfile> {
  constructor(private readonly dataSource: DataSource) {
    super(ClientProfile, dataSource.createEntityManager());
  }
}
