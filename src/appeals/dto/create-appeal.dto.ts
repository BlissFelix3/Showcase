import {
  IsString,
  IsEnum,
  IsOptional,
  IsBoolean,
  IsUUID,
  IsArray,
} from 'class-validator';
import { AppealType } from '../entities/appeal.entity';

export class CreateAppealDto {
  @IsUUID()
  @IsOptional()
  caseId?: string;

  @IsEnum(AppealType)
  type: AppealType;

  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  evidence?: string[];

  @IsBoolean()
  @IsOptional()
  isUrgent?: boolean;

  @IsString()
  @IsOptional()
  language?: string;
}
