import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { TypeOrmRepository } from '../../config/repository/typeorm.repository';
import { Rating } from '../entities/rating.entity';

@Injectable()
export class RatingRepository extends TypeOrmRepository<Rating> {
  constructor(private readonly dataSource: DataSource) {
    super(Rating, dataSource.createEntityManager());
  }
}
