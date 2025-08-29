import { Injectable } from '@nestjs/common';
import { TypeOrmRepository } from '../../config/repository/typeorm.repository';
import { VerificationDocument } from '../entities/verification-document.entity';
import { DataSource } from 'typeorm';

@Injectable()
export class VerificationDocumentRepository extends TypeOrmRepository<VerificationDocument> {
  constructor(private readonly dataSource: DataSource) {
    super(VerificationDocument, dataSource.createEntityManager());
  }
}
