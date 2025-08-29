import {
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateReviewDto {
  @ApiProperty({
    description: 'Rating from 1 to 5 stars',
    example: 5,
    minimum: 1,
    maximum: 5,
  })
  @IsNumber()
  @Min(1)
  @Max(5)
  rating!: number;

  @ApiProperty({
    description: 'Review comment',
    example: 'Excellent lawyer, very professional and knowledgeable',
    required: false,
  })
  @IsOptional()
  @IsString()
  comment?: string;

  @ApiProperty({
    description: 'Type of case handled',
    example: 'Property Dispute',
    required: false,
  })
  @IsOptional()
  @IsString()
  caseType?: string;

  @ApiProperty({
    description: 'Outcome of the case',
    example: 'Settled out of court successfully',
    required: false,
  })
  @IsOptional()
  @IsString()
  caseOutcome?: string;

  @ApiProperty({
    description: 'Whether the review is anonymous',
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isAnonymous?: boolean;
}
