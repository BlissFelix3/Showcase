import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { TypeOrmRepository } from '../../config/repository/typeorm.repository';
import { DeviceToken } from '../entities/device-token.entity';

@Injectable()
export class DeviceTokenRepository extends TypeOrmRepository<DeviceToken> {
  constructor(private readonly dataSource: DataSource) {
    super(DeviceToken, dataSource.createEntityManager());
  }
}
