import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ConsultationRepository } from './repositories/consultation.repository';
import { CreateConsultationDto } from './dto/create-consultation.dto';
import { PaymentsService } from '../payments/payments.service';
import { ConsultationStatus } from './entities/consultation.entity';
import { LocalEvents } from '../utils/constants';

@Injectable()
export class AIConsultationService {
  private readonly logger = new Logger(AIConsultationService.name);

  constructor(
    private readonly consultationRepository: ConsultationRepository,
    private readonly paymentsService: PaymentsService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async createConsultation(clientId: string, dto: CreateConsultationDto) {
    const consultation = this.consultationRepository.create({
      client: { id: clientId },
      legalProblem: dto.legalProblem,
      type: dto.type || 'INITIAL',
      language: dto.language || 'en',
      amountMinor: this.calculateConsultationFee(dto.type),
    });

    const saved = await this.consultationRepository.save(consultation);

    // Create payment for consultation
    const payment = await this.paymentsService.createConsultationPayment(
      clientId,
      saved.amountMinor,
    );

    // Update consultation with payment reference
    saved.paymentReference = payment.providerRef;
    const finalConsultation = await this.consultationRepository.save(saved);

    // Emit consultation created event for notifications
    this.eventEmitter.emit(LocalEvents.AI_CONSULTATION_CREATED, {
      userId: clientId,
      slug: 'consultation-created',
      consultation: finalConsultation,
    });

    return finalConsultation;
  }

  async processAIConsultation(id: string) {
    const consultation = await this.consultationRepository.findOne({
      where: { id },
      relations: ['client'],
    });

    if (!consultation) {
      throw new NotFoundException('Consultation not found');
    }

    if (!consultation.isPaid) {
      throw new Error('Consultation must be paid before processing');
    }

    // Simulate AI processing (in production, this would call actual AI service)
    consultation.status = 'IN_PROGRESS';
    consultation.aiAnalysis = await this.generateAIAnalysis(
      consultation.legalProblem,
    );
    consultation.recommendations = await this.generateRecommendations();
    consultation.status = 'COMPLETED';

    const savedConsultation =
      await this.consultationRepository.save(consultation);

    // Emit consultation processed event for notifications
    this.eventEmitter.emit(LocalEvents.AI_CONSULTATION_PROCESSED, {
      userId: consultation.client.id,
      slug: 'consultation-processed',
      consultation: savedConsultation,
    });

    return savedConsultation;
  }

  async updateConsultationStatus(id: string, status: ConsultationStatus) {
    const consultation = await this.consultationRepository.findOne({
      where: { id },
    });

    if (!consultation) {
      throw new NotFoundException('Consultation not found');
    }

    consultation.status = status;
    return this.consultationRepository.save(consultation);
  }

  async getConsultationById(id: string) {
    const consultation = await this.consultationRepository.findOne({
      where: { id },
      relations: ['client'],
    });

    if (!consultation) {
      throw new NotFoundException('Consultation not found');
    }

    return consultation;
  }

  async getClientConsultations(clientId: string) {
    return this.consultationRepository.find({
      where: { client: { id: clientId } },
      order: { createdAt: 'DESC' },
    });
  }

  private calculateConsultationFee(type?: string): number {
    const fees: Record<string, number> = {
      INITIAL: 5000, // 50 NGN
      FOLLOW_UP: 3000, // 30 NGN
      SPECIALIST: 10000, // 100 NGN
    };

    return fees[type || 'INITIAL'] || 5000;
  }

  private async generateAIAnalysis(legalProblem: string) {
    // Simulate AI analysis (replace with actual AI service call)
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return `AI Analysis of your legal problem: "${legalProblem}"

Based on the information provided, this appears to be a legal matter that requires careful consideration. The AI has analyzed the key elements and identified several important factors that should be addressed.

Key Points:
- Legal jurisdiction considerations
- Applicable laws and regulations
- Potential legal remedies
- Risk assessment and recommendations

This analysis provides a foundation for further legal consultation and decision-making.`;
  }

  private async generateRecommendations() {
    // Simulate AI recommendations (replace with actual AI service call)
    await new Promise((resolve) => setTimeout(resolve, 500));

    return `Based on the AI analysis, here are your recommended options:

1. **Mediation (Recommended)**
   - Cost-effective and faster resolution
   - Maintains relationships
   - Professional mediator assistance

2. **Out-of-Court Settlement**
   - Negotiated agreement
   - Avoids litigation costs
   - Faster resolution than court

3. **Legal Consultation**
   - Professional legal advice
   - Understanding of rights and options
   - Strategic planning

4. **Litigation (Last Resort)**
   - Formal court proceedings
   - Higher costs and longer timeline
   - Adversarial process

The AI recommends starting with mediation as it offers the best balance of cost, speed, and relationship preservation.`;
  }
}
