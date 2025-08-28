import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsIn,
  IsUUID,
  IsInt,
  Min,
  IsDateString,
} from 'class-validator';
import type { TaskPriority } from '../entities/task.entity';

export class CreateTaskDto {
  @IsUUID()
  @IsNotEmpty()
  caseId!: string;

  @IsOptional()
  @IsUUID()
  milestoneId?: string;

  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsIn(['LOW', 'MEDIUM', 'HIGH', 'URGENT'])
  priority?: TaskPriority;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  estimatedHours?: number;
}
