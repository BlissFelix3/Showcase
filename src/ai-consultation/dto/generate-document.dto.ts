import { IsString, IsNotEmpty, IsOptional, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GenerateDocumentDto {
  @ApiProperty({
    description: 'Type of legal document to generate',
    example: 'sale_agreement',
    enum: [
      'sale_agreement',
      'rent_agreement',
      'quit_notice',
      'employment_contract',
      'partnership_agreement',
      'loan_agreement',
      'nda',
      'power_of_attorney',
      'will',
      'custom',
    ],
  })
  @IsString()
  @IsNotEmpty()
  @IsIn([
    'sale_agreement',
    'rent_agreement',
    'quit_notice',
    'employment_contract',
    'partnership_agreement',
    'loan_agreement',
    'nda',
    'power_of_attorney',
    'will',
    'custom',
  ])
  documentType!: string;

  @ApiProperty({
    description: 'Context and details for the document generation',
    example:
      'I need a sale agreement for selling my car to a friend. The car is a 2018 Toyota Camry with registration number ABC123XY.',
  })
  @IsString()
  @IsNotEmpty()
  context!: string;

  @ApiProperty({
    description: 'Language preference for the document',
    example: 'en',
    default: 'en',
    required: false,
  })
  @IsOptional()
  @IsString()
  language?: string;

  @ApiProperty({
    description: 'Additional customizations for the document',
    example: { includeArbitration: true, paymentTerms: 'installment' },
    required: false,
  })
  @IsOptional()
  customizations?: Record<string, any>;
}
