import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsIn,
  IsUUID,
} from 'class-validator';
import type {
  ComplaintType,
  ComplaintSeverity,
} from '../entities/complaint.entity';

export class CreateComplaintDto {
  @IsUUID()
  @IsNotEmpty()
  respondentId!: string;

  @IsOptional()
  @IsUUID()
  caseId?: string;

  @IsIn([
    'NON_COMPLETION',
    'POOR_EXECUTION',
    'COMMUNICATION',
    'PAYMENT',
    'OTHER',
  ])
  type!: ComplaintType;

  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsOptional()
  @IsIn(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'])
  severity?: ComplaintSeverity;
}
