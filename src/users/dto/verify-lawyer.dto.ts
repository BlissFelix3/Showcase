import { IsString, IsEnum, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum VerificationAction {
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
  REQUEST_MORE_INFO = 'REQUEST_MORE_INFO',
}

export class VerifyLawyerDto {
  @ApiProperty({
    description: 'Action to take on the verification',
    enum: VerificationAction,
    example: VerificationAction.APPROVE,
  })
  @IsEnum(VerificationAction)
  action!: VerificationAction;

  @ApiProperty({
    description: 'Notes about the verification decision',
    example:
      'All documents verified successfully. Lawyer meets all requirements.',
    required: false,
  })
  @IsOptional()
  @IsString()
  verificationNotes?: string;

  @ApiProperty({
    description: 'Reason for rejection if action is REJECT',
    example:
      'Call to bar certificate expired. Please upload current certificate.',
    required: false,
  })
  @IsOptional()
  @IsString()
  rejectionReason?: string;

  @ApiProperty({
    description: 'Whether to send notification to the lawyer',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  sendNotification?: boolean;
}
