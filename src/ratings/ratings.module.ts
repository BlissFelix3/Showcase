import { Module } from '@nestjs/common';
import { RatingsController } from './ratings.controller';
import { RatingsService } from './ratings.service';
import { RatingRepository } from './repositories/rating.repository';

@Module({
  controllers: [RatingsController],
  providers: [RatingsService, RatingRepository],
  exports: [RatingsService],
})
export class RatingsModule {}
