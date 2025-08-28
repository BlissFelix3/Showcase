import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LawyerRecommendationsDto {
  @ApiProperty({
    description: 'Detailed description of the legal case',
    example:
      'I have a property dispute with my neighbor over boundary lines. The issue has been ongoing for 6 months and we have tried mediation but failed to reach agreement.',
  })
  @IsString()
  @IsNotEmpty()
  caseDetails!: string;

  @ApiProperty({
    description: 'Legal jurisdiction for the case',
    example: 'Lagos State, Nigeria',
  })
  @IsString()
  @IsNotEmpty()
  jurisdiction!: string;

  @ApiProperty({
    description: 'Practice area required for the case',
    example: 'Property Law',
    enum: [
      'Property Law',
      'Family Law',
      'Criminal Law',
      'Corporate Law',
      'Employment Law',
      'Intellectual Property',
      'Tax Law',
      'Immigration Law',
      'Environmental Law',
      'Banking Law',
      'Custom',
    ],
  })
  @IsString()
  @IsNotEmpty()
  practiceArea!: string;

  @ApiProperty({
    description: 'Language preference for recommendations',
    example: 'en',
    default: 'en',
    required: false,
  })
  @IsOptional()
  @IsString()
  language?: string;

  @ApiProperty({
    description: 'Client preferences for lawyer selection',
    example: {
      experienceLevel: '5+ years',
      maxBudget: '500000',
      preferredLocation: 'Victoria Island, Lagos',
      communicationStyle: 'responsive',
    },
    required: false,
  })
  @IsOptional()
  clientPreferences?: {
    experienceLevel?: string;
    maxBudget?: string;
    preferredLocation?: string;
    communicationStyle?: string;
    availability?: string;
    [key: string]: any;
  };
}
