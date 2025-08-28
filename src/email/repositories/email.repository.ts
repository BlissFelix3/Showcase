import { Injectable } from '@nestjs/common';
import { TypeOrmRepository } from 'src/config/repository/typeorm.repository';
import { EmailTemplate } from '../entities/email.entity';
import { DataSource } from 'typeorm';

@Injectable()
export class EmailTemplateRepository extends TypeOrmRepository<EmailTemplate> {
  constructor(private readonly dataSource: DataSource) {
    super(EmailTemplate, dataSource.createEntityManager());
  }
}
