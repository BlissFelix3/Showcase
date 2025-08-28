import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsIn,
  IsUUID,
  IsInt,
  Min,
  Max,
  IsBoolean,
} from 'class-validator';

export class CreateRatingDto {
  @IsUUID()
  @IsNotEmpty()
  ratedId!: string;

  @IsOptional()
  @IsUUID()
  caseId?: string;

  @IsOptional()
  @IsUUID()
  milestoneId?: string;

  @IsInt()
  @Min(1)
  @Max(5)
  overallRating!: number;

  @IsInt()
  @Min(1)
  @Max(5)
  communicationRating!: number;

  @IsInt()
  @Min(1)
  @Max(5)
  expertiseRating!: number;

  @IsInt()
  @Min(1)
  @Max(5)
  professionalismRating!: number;

  @IsInt()
  @Min(1)
  @Max(5)
  valueRating!: number;

  @IsOptional()
  @IsString()
  comment?: string;

  @IsOptional()
  @IsBoolean()
  isAnonymous?: boolean;
}
