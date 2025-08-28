import {
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  IsDateString,
  IsBoolean,
  Min,
  Max,
} from 'class-validator';
import { BriefPriority } from '../entities/client-brief.entity';

export class CreateClientBriefDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsString()
  @IsOptional()
  legalProblem?: string;

  @IsString()
  @IsOptional()
  desiredOutcome?: string;

  @IsEnum(BriefPriority)
  @IsOptional()
  priority?: BriefPriority;

  @IsString()
  @IsOptional()
  jurisdiction?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  budgetRangeMin?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  budgetRangeMax?: number;

  @IsString()
  @IsOptional()
  language?: string;

  @IsDateString()
  @IsOptional()
  deadline?: string;

  @IsBoolean()
  @IsOptional()
  isUrgent?: boolean;

  @IsBoolean()
  @IsOptional()
  requiresMediation?: boolean;
}
