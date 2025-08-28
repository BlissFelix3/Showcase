import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsIn,
  IsObject,
} from 'class-validator';
import type { DocumentType } from '../entities/document.entity';

export class GenerateDocumentDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsIn([
    'SALE_AGREEMENT',
    'RENT_AGREEMENT',
    'QUIT_NOTICE',
    'CONTRACT',
    'LEGAL_LETTER',
    'AFFIDAVIT',
    'POWER_OF_ATTORNEY',
    'WILL',
    'CUSTOM',
  ])
  type!: DocumentType;

  @IsOptional()
  @IsString()
  description?: string;

  @IsObject()
  templateData!: Record<string, any>;

  @IsOptional()
  @IsString()
  language?: string;

  @IsOptional()
  @IsString()
  caseId?: string;
}
