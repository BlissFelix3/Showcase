import { IsNumber, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SubmitProposalDto {
  @ApiProperty({
    description: 'Quoted fee in smallest currency unit (e.g., kobo for NGN)',
    example: 250000,
    minimum: 1000,
    maximum: 10000000,
  })
  @IsNumber()
  @Min(1000, { message: 'Fee must be at least 1000 (10 NGN)' })
  @Max(10000000, { message: 'Fee cannot exceed 100,000 NGN' })
  quotedFeeMinor!: number;
}
