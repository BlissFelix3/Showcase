import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SubscribeToTopicDto {
  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  deviceToken: string;

  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  topic: string;
}

export class UnsubscribeFromTopicDto {
  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  deviceToken: string;

  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  topic: string;
}
