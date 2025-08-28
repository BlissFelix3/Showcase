import {
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    description: 'User password (min 6 characters)',
    example: 'secret123',
  })
  @IsString()
  @MinLength(6)
  @MaxLength(128)
  password!: string;

  @ApiProperty({
    description: 'User role',
    enum: ['LAWYER', 'CLIENT'],
    example: 'CLIENT',
  })
  @IsString()
  @IsIn(['LAWYER', 'CLIENT'])
  role!: 'LAWYER' | 'CLIENT';

  @ApiProperty({ description: 'Full name', example: 'John Doe' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  fullName!: string;

  @ApiProperty({
    description: 'Phone number (optional)',
    example: '+2348012345678',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Matches(/^\+?[1-9]\d{1,14}$/, {
    message: 'Phone number must be a valid international format',
  })
  phone?: string;
}
