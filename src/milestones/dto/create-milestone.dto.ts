import {
  IsString,
  IsOptional,
  MinLength,
  MaxLength,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMilestoneDto {
  @ApiProperty({
    description: 'Milestone title',
    example: 'Initial Consultation',
    minLength: 3,
    maxLength: 200,
  })
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  title!: string;

  @ApiProperty({
    description: 'Milestone description',
    example: 'Complete initial client consultation and case assessment',
    required: false,
    minLength: 10,
    maxLength: 1000,
  })
  @IsOptional()
  @IsString()
  @MinLength(10)
  @MaxLength(1000)
  description?: string;

  @ApiProperty({
    description: 'Percentage of total fee for this milestone',
    example: 30,
    minimum: 1,
    maximum: 100,
  })
  @IsNumber()
  @Min(1, { message: 'Tranche percentage must be at least 1%' })
  @Max(100, { message: 'Tranche percentage cannot exceed 100%' })
  tranchePercent!: number;
}
