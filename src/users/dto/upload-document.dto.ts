import {
  IsString,
  IsEnum,
  IsOptional,
  IsDateString,
  IsBoolean,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { DocumentType } from '../entities/verification-document.entity';

export class UploadDocumentDto {
  @ApiProperty({
    description: 'Type of document being uploaded',
    enum: DocumentType,
    example: DocumentType.CALL_TO_BAR_CERTIFICATE,
  })
  @IsEnum(DocumentType)
  documentType!: DocumentType;

  @ApiProperty({
    description: 'Original filename of the document',
    example: 'call_to_bar_certificate.pdf',
    required: false,
  })
  @IsOptional()
  @IsString()
  originalFileName?: string;

  @ApiProperty({
    description: 'Document number (for certificates, IDs, etc.)',
    example: 'BL/2020/12345',
    required: false,
  })
  @IsOptional()
  @IsString()
  documentNumber?: string;

  @ApiProperty({
    description: 'Date when the document was issued',
    example: '2020-01-15',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  issueDate?: string;

  @ApiProperty({
    description: 'Date when the document expires',
    example: '2030-01-15',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  expiryDate?: string;

  @ApiProperty({
    description: 'Authority that issued the document',
    example: 'Nigerian Law School',
    required: false,
  })
  @IsOptional()
  @IsString()
  issuingAuthority?: string;

  @ApiProperty({
    description: 'Whether this is the primary document for this type',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;

  @ApiProperty({
    description: 'Additional metadata as JSON string',
    example: '{"verificationLevel": "high", "issuerContact": "+2348012345678"}',
    required: false,
  })
  @IsOptional()
  @IsString()
  metadata?: string;
}
