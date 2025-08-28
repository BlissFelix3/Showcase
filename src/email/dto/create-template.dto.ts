import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsString, IsNotEmpty, IsEmail } from 'class-validator';

export class CreateEmailTemplateDto {
  @ApiProperty()
  @IsString()
  @IsDefined()
  @IsNotEmpty()
  slug: string;

  @ApiProperty()
  @IsString()
  @IsDefined()
  @IsNotEmpty()
  templateId: string;

  @ApiProperty()
  @IsString()
  @IsDefined()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsEmail()
  @IsDefined()
  @IsNotEmpty()
  from: string;

  @ApiProperty()
  @IsString()
  @IsDefined()
  @IsNotEmpty()
  subject: string;
}
