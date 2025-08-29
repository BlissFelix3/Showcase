import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsUrl,
  IsArray,
  Min,
  Max,
  IsEnum,
  ValidateNested,
  IsLatitude,
  IsLongitude,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class PracticeAreaDto {
  @ApiProperty({
    description: 'Practice area ID',
    example: 'uuid-string',
  })
  @IsString()
  id!: string;

  @ApiProperty({
    description: 'Practice area name',
    example: 'Property Law',
  })
  @IsString()
  name!: string;
}

export class UpdateLawyerProfileDto {
  @ApiProperty({
    description: 'Full name of the lawyer',
    example: 'John Doe',
    required: false,
  })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiProperty({
    description: 'Phone number',
    example: '+2348012345678',
    required: false,
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({
    description: 'LinkedIn profile URL',
    example: 'https://linkedin.com/in/johndoe',
    required: false,
  })
  @IsOptional()
  @IsUrl()
  linkedinUrl?: string;

  @ApiProperty({
    description: 'Twitter profile URL',
    example: 'https://twitter.com/johndoe',
    required: false,
  })
  @IsOptional()
  @IsUrl()
  twitterUrl?: string;

  @ApiProperty({
    description: 'Professional bio',
    example: 'Experienced property lawyer with 10+ years in real estate law',
    required: false,
  })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiProperty({
    description: 'Professional experience description',
    example:
      'Specialized in property disputes, contract law, and real estate transactions',
    required: false,
  })
  @IsOptional()
  @IsString()
  experience?: string;

  @ApiProperty({
    description: 'Years of legal experience',
    example: 10,
    minimum: 0,
    maximum: 50,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(50)
  yearsOfExperience?: number;

  @ApiProperty({
    description: 'Educational background',
    example: 'LLB from University of Lagos, BL from Nigerian Law School',
    required: false,
  })
  @IsOptional()
  @IsString()
  education?: string;

  @ApiProperty({
    description: 'Specializations within practice areas',
    example: 'Commercial property, Land disputes, Real estate transactions',
    required: false,
  })
  @IsOptional()
  @IsString()
  specializations?: string;

  @ApiProperty({
    description: 'Languages spoken',
    example: 'English, Yoruba, French',
    required: false,
  })
  @IsOptional()
  @IsString()
  languages?: string;

  @ApiProperty({
    description: 'Whether the lawyer is currently available for new cases',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;

  @ApiProperty({
    description: 'Notes about availability',
    example: 'Available for consultations on weekdays, 9 AM - 5 PM',
    required: false,
  })
  @IsOptional()
  @IsString()
  availabilityNotes?: string;

  @ApiProperty({
    description: 'Hourly rate in NGN',
    example: 25000,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  hourlyRate?: number;

  @ApiProperty({
    description: 'Fee structure description',
    example: 'Hourly rate: ₦25,000, Consultation: ₦50,000, Contingency: 20%',
    required: false,
  })
  @IsOptional()
  @IsString()
  feeStructure?: string;

  @ApiProperty({
    description: 'Geographic latitude for location-based matching',
    example: 6.5244,
    required: false,
  })
  @IsOptional()
  @IsLatitude()
  latitude?: number;

  @ApiProperty({
    description: 'Geographic longitude for location-based matching',
    example: 3.3792,
    required: false,
  })
  @IsOptional()
  @IsLongitude()
  longitude?: number;

  @ApiProperty({
    description: 'Practice areas',
    type: [PracticeAreaDto],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PracticeAreaDto)
  practiceAreas?: PracticeAreaDto[];
}
