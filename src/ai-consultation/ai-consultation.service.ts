import { Injectable, Logger, NotFoundException } from '@nestjs/common';

import { ConsultationRepository } from './repositories/consultation.repository';
import { CreateConsultationDto } from './dto/create-consultation.dto';
import { PaymentsService } from '../payments/payments.service';
import { ConsultationStatus } from './entities/consultation.entity';
import { LocalEvents } from '../utils/constants';
import { GeminiAIService, AIConsultationRequest } from './gemini-ai.service';

@Injectable()
export class AIConsultationService {
  private readonly logger = new Logger(AIConsultationService.name);

  constructor(
    private readonly consultationRepository: ConsultationRepository,
    private readonly paymentsService: PaymentsService,
    private readonly geminiAIService: GeminiAIService,
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

    const payment = await this.paymentsService.createConsultationPayment(
      clientId,
      saved.amountMinor,
    );

    saved.paymentReference = payment.providerRef;
    const finalConsultation = await this.consultationRepository.save(saved);

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

    try {
      consultation.status = 'IN_PROGRESS';
      await this.consultationRepository.save(consultation);

      const aiRequest: AIConsultationRequest = {
        legalProblem: consultation.legalProblem,
        language: consultation.language || 'en',
        context: {
          consultationId: consultation.id,
          clientId: consultation.client.id,
          type: consultation.type,
        },
      };

      const aiResponse =
        await this.geminiAIService.generateLegalConsultation(aiRequest);

      consultation.aiAnalysis = aiResponse.analysis;
      consultation.recommendations = aiResponse.recommendations;
      consultation.chosenOption = aiResponse.chosenOption || null;
      consultation.aiResponse = JSON.stringify(aiResponse);
      consultation.metadata = {
        ...aiResponse.metadata,
        estimatedCosts: aiResponse.estimatedCosts,
        timeline: aiResponse.timeline,
        nextSteps: aiResponse.nextSteps,
      };
      consultation.status = 'COMPLETED';

      const savedConsultation =
        await this.consultationRepository.save(consultation);

      this.logger.log(`AI consultation processed successfully for ID: ${id}`);
      return savedConsultation;
    } catch (error) {
      this.logger.error(`Error processing AI consultation ${id}:`, error);

      consultation.status = 'CANCELLED';
      consultation.metadata = {
        ...consultation.metadata,
        error: error.message,
        processedAt: new Date().toISOString(),
      };

      await this.consultationRepository.save(consultation);

      throw new Error(`Failed to process AI consultation: ${error.message}`);
    }
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

  async generateLegalDocument(
    clientId: string,
    documentType: string,
    context: string,
    language: string = 'en',
  ) {
    try {
      const documentResponse = await this.geminiAIService.generateLegalDocument(
        {
          documentType,
          context,
          language,
        },
      );

      return {
        ...documentResponse,
        metadata: {
          clientId,
          documentType,
          language,
          generatedAt: new Date().toISOString(),
        },
      };
    } catch (error) {
      this.logger.error(
        `Error generating legal document for client ${clientId}:`,
        error,
      );
      throw new Error(`Failed to generate legal document: ${error.message}`);
    }
  }

  async generateLawyerRecommendations(
    clientId: string,
    caseDetails: string,
    jurisdiction: string,
    practiceArea: string,
    language: string = 'en',
  ) {
    try {
      const recommendations =
        await this.geminiAIService.generateLawyerRecommendations({
          caseDetails,
          jurisdiction,
          practiceArea,
          language,
        });

      return {
        ...recommendations,
        metadata: {
          clientId,
          jurisdiction,
          practiceArea,
          language,
          generatedAt: new Date().toISOString(),
        },
      };
    } catch (error) {
      this.logger.error(
        `Error generating lawyer recommendations for client ${clientId}:`,
        error,
      );
      throw new Error(
        `Failed to generate lawyer recommendations: ${error.message}`,
      );
    }
  }

  async generateLawReports(
    topic: string,
    jurisdiction: string,
    language: string = 'en',
  ) {
    try {
      const reports = await this.geminiAIService.generateLawReports(
        topic,
        jurisdiction,
        language,
      );

      return {
        reports,
        metadata: {
          topic,
          jurisdiction,
          language,
          generatedAt: new Date().toISOString(),
        },
      };
    } catch (error) {
      this.logger.error(
        `Error generating law reports for topic ${topic}:`,
        error,
      );
      throw new Error(`Failed to generate law reports: ${error.message}`);
    }
  }

  async checkAIServiceHealth(): Promise<boolean> {
    try {
      return await this.geminiAIService.healthCheck();
    } catch (error) {
      this.logger.error('AI service health check failed:', error);
      return false;
    }
  }

  private calculateConsultationFee(type?: string): number {
    const fees: Record<string, number> = {
      INITIAL: 5000,
      FOLLOW_UP: 3000,
      SPECIALIST: 10000,
    };

    return fees[type || 'INITIAL'] || 5000;
  }
}
