import { Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { RatingRepository } from './repositories/rating.repository';
import { CreateRatingDto } from './dto/create-rating.dto';
import { LocalEvents } from '../utils/constants';

@Injectable()
export class RatingsService {
  constructor(
    private readonly ratingRepository: RatingRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(createRatingDto: CreateRatingDto, userId: string) {
    const raterRef = { id: userId };
    const ratedRef = { id: createRatingDto.ratedId };
    const caseRef = createRatingDto.caseId
      ? { id: createRatingDto.caseId }
      : null;
    const milestoneRef = createRatingDto.milestoneId
      ? { id: createRatingDto.milestoneId }
      : null;

    const rating = this.ratingRepository.create({
      rater: raterRef,
      rated: ratedRef,
      caseEntity: caseRef,
      milestone: milestoneRef,
      overallRating: createRatingDto.overallRating,
      communicationRating: createRatingDto.communicationRating,
      expertiseRating: createRatingDto.expertiseRating,
      professionalismRating: createRatingDto.professionalismRating,
      valueRating: createRatingDto.valueRating,
      comment: createRatingDto.comment,
      isAnonymous: createRatingDto.isAnonymous || false,
    });

    const savedRating = await this.ratingRepository.save(rating);

    this.eventEmitter.emit(LocalEvents.RATING_RECEIVED, {
      userId: createRatingDto.ratedId,
      slug: 'rating-received',
      rating: savedRating,
    });

    return savedRating;
  }

  async findByLawyer(lawyerId: string) {
    return this.ratingRepository.find({
      where: { rated: { id: lawyerId } },
      relations: ['rater', 'caseEntity', 'milestone'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByCase(caseId: string) {
    return this.ratingRepository.find({
      where: { caseEntity: { id: caseId } },
      relations: ['rater', 'rated'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string) {
    const rating = await this.ratingRepository.findOne({
      where: { id },
      relations: ['rater', 'rated', 'caseEntity', 'milestone'],
    });

    if (!rating) {
      throw new NotFoundException('Rating not found');
    }

    return rating;
  }

  async getLawyerAverageRating(lawyerId: string) {
    const ratings = await this.findByLawyer(lawyerId);

    if (ratings.length === 0) {
      return {
        overall: 0,
        communication: 0,
        expertise: 0,
        professionalism: 0,
        value: 0,
        totalRatings: 0,
      };
    }

    const totals = ratings.reduce(
      (acc, rating) => ({
        overall: acc.overall + rating.overallRating,
        communication: acc.communication + rating.communicationRating,
        expertise: acc.expertise + rating.expertiseRating,
        professionalism: acc.professionalism + rating.professionalismRating,
        value: acc.value + rating.valueRating,
      }),
      {
        overall: 0,
        communication: 0,
        expertise: 0,
        professionalism: 0,
        value: 0,
      },
    );

    return {
      overall: Math.round((totals.overall / ratings.length) * 10) / 10,
      communication:
        Math.round((totals.communication / ratings.length) * 10) / 10,
      expertise: Math.round((totals.expertise / ratings.length) * 10) / 10,
      professionalism:
        Math.round((totals.professionalism / ratings.length) * 10) / 10,
      value: Math.round((totals.value / ratings.length) * 10) / 10,
      totalRatings: ratings.length,
    };
  }
}
