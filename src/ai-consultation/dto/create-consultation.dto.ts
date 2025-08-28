import { IsString, IsNotEmpty, IsOptional, IsIn } from 'class-validator';

export class CreateConsultationDto {
  @IsString()
  @IsNotEmpty()
  legalProblem!: string;

  @IsOptional()
  @IsString()
  language?: string;

  @IsOptional()
  @IsIn(['INITIAL', 'FOLLOW_UP', 'SPECIALIST'])
  type?: 'INITIAL' | 'FOLLOW_UP' | 'SPECIALIST';
}
