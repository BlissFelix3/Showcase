import { Module } from '@nestjs/common';
import { AIConsultationController } from './ai-consultation.controller';
import { AIConsultationService } from './ai-consultation.service';
import { ConsultationRepository } from './repositories/consultation.repository';
import { PaymentsModule } from '../payments/payments.module';

@Module({
  imports: [PaymentsModule],
  controllers: [AIConsultationController],
  providers: [AIConsultationService, ConsultationRepository],
  exports: [AIConsultationService],
})
export class AIConsultationModule {}
