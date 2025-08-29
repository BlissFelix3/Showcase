import { Injectable } from '@nestjs/common';
import { TypeOrmRepository } from '../../config/repository/typeorm.repository';
import { LawyerReview } from '../entities/lawyer-review.entity';
import { DataSource } from 'typeorm';

@Injectable()
export class LawyerReviewRepository extends TypeOrmRepository<LawyerReview> {
  constructor(private readonly dataSource: DataSource) {
    super(LawyerReview, dataSource.createEntityManager());
  }
}
