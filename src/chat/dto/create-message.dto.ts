import { IsString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class CreateMessageDto {
  @IsString()
  @IsNotEmpty()
  content!: string;

  @IsUUID()
  @IsNotEmpty()
  recipientId!: string;

  @IsOptional()
  @IsUUID()
  caseId?: string;
}
