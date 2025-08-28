import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { TypeOrmRepository } from '../../config/repository/typeorm.repository';
import { LanguagePreference } from '../entities/language-preference.entity';

@Injectable()
export class LanguagePreferenceRepository extends TypeOrmRepository<LanguagePreference> {
  constructor(private readonly dataSource: DataSource) {
    super(LanguagePreference, dataSource.createEntityManager());
  }
}
