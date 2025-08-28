import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AIConsultationService } from './ai-consultation.service';
import { GeminiAIService } from './gemini-ai.service';
import { ConsultationRepository } from './repositories/consultation.repository';
import { PaymentsService } from '../payments/payments.service';
import { LocalEvents } from '../utils/constants';

describe('AIConsultationService', () => {
  let service: AIConsultationService;
  let geminiAIService: GeminiAIService;
  let consultationRepository: ConsultationRepository;
  let paymentsService: PaymentsService;
  let eventEmitter: EventEmitter2;

  const mockConsultationRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
  };

  const mockPaymentsService = {
    createConsultationPayment: jest.fn(),
  };

  const mockEventEmitter = {
    emit: jest.fn(),
  };

  const mockGeminiAIService = {
    generateLegalConsultation: jest.fn(),
    generateLegalDocument: jest.fn(),
    generateLawyerRecommendations: jest.fn(),
    generateLawReports: jest.fn(),
    healthCheck: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AIConsultationService,
        {
          provide: ConsultationRepository,
          useValue: mockConsultationRepository,
        },
        {
          provide: PaymentsService,
          useValue: mockPaymentsService,
        },
        {
          provide: EventEmitter2,
          useValue: mockEventEmitter,
        },
        {
          provide: GeminiAIService,
          useValue: mockGeminiAIService,
        },
      ],
    }).compile();

    service = module.get<AIConsultationService>(AIConsultationService);
    geminiAIService = module.get<GeminiAIService>(GeminiAIService);
    consultationRepository = module.get<ConsultationRepository>(
      ConsultationRepository,
    );
    paymentsService = module.get<PaymentsService>(PaymentsService);
    eventEmitter = module.get<EventEmitter2>(EventEmitter2);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createConsultation', () => {
    it('should create a consultation successfully', async () => {
      const clientId = 'client-123';
      const dto = {
        legalProblem: 'I have a property dispute with my neighbor',
        language: 'en',
        type: 'INITIAL' as const,
      };

      const mockConsultation = {
        id: 'consultation-123',
        client: { id: clientId },
        legalProblem: dto.legalProblem,
        type: dto.type,
        language: dto.language,
        amountMinor: 5000,
        paymentReference: null,
      };

      const mockPayment = {
        providerRef: 'pay-123',
      };

      mockConsultationRepository.create.mockReturnValue(mockConsultation);
      mockConsultationRepository.save.mockResolvedValue(mockConsultation);
      mockPaymentsService.createConsultationPayment.mockResolvedValue(
        mockPayment,
      );

      const result = await service.createConsultation(clientId, dto);

      expect(result).toBeDefined();
      expect(result.paymentReference).toBe('pay-123');
      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        LocalEvents.AI_CONSULTATION_CREATED,
        expect.objectContaining({
          userId: clientId,
          slug: 'consultation-created',
        }),
      );
    });
  });

  describe('processAIConsultation', () => {
    it('should process AI consultation successfully', async () => {
      const consultationId = 'consultation-123';
      const mockConsultation = {
        id: consultationId,
        client: { id: 'client-123' },
        legalProblem: 'Property dispute case',
        language: 'en',
        type: 'INITIAL',
        isPaid: true,
        status: 'PENDING',
      };

      const mockAIResponse = {
        analysis: 'This is a property boundary dispute...',
        recommendations: 'Consider mediation first...',
        chosenOption: 'mediation',
        estimatedCosts: { estimated: '50,000 NGN' },
        timeline: { estimated: '2-3 months' },
        nextSteps: ['Contact mediator', 'Gather documents'],
        metadata: { model: 'gemini-1.5-flash' },
      };

      mockConsultationRepository.findOne.mockResolvedValue(mockConsultation);
      mockConsultationRepository.save.mockResolvedValue({
        ...mockConsultation,
        status: 'COMPLETED',
        aiAnalysis: mockAIResponse.analysis,
        recommendations: mockAIResponse.recommendations,
      });
      mockGeminiAIService.generateLegalConsultation.mockResolvedValue(
        mockAIResponse,
      );

      const result = await service.processAIConsultation(consultationId);

      expect(result.status).toBe('COMPLETED');
      expect(result.aiAnalysis).toBe(mockAIResponse.analysis);
      expect(result.recommendations).toBe(mockAIResponse.recommendations);
      expect(
        mockGeminiAIService.generateLegalConsultation,
      ).toHaveBeenCalledWith({
        legalProblem: mockConsultation.legalProblem,
        language: mockConsultation.language,
        context: {
          consultationId: mockConsultation.id,
          clientId: mockConsultation.client.id,
          type: mockConsultation.type,
        },
      });
    });

    it('should handle AI consultation processing failure', async () => {
      const consultationId = 'consultation-123';
      const mockConsultation = {
        id: consultationId,
        client: { id: 'client-123' },
        legalProblem: 'Property dispute case',
        language: 'en',
        type: 'INITIAL',
        isPaid: true,
        status: 'PENDING',
      };

      mockConsultationRepository.findOne.mockResolvedValue(mockConsultation);
      mockGeminiAIService.generateLegalConsultation.mockRejectedValue(
        new Error('AI service unavailable'),
      );

      await expect(
        service.processAIConsultation(consultationId),
      ).rejects.toThrow(
        'Failed to process AI consultation: AI service unavailable',
      );

      expect(mockConsultationRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'CANCELLED',
          metadata: expect.objectContaining({
            error: 'AI service unavailable',
          }),
        }),
      );
    });

    it('should throw error for unpaid consultation', async () => {
      const consultationId = 'consultation-123';
      const mockConsultation = {
        id: consultationId,
        client: { id: 'client-123' },
        legalProblem: 'Property dispute case',
        isPaid: false,
      };

      mockConsultationRepository.findOne.mockResolvedValue(mockConsultation);

      await expect(
        service.processAIConsultation(consultationId),
      ).rejects.toThrow('Consultation must be paid before processing');
    });
  });

  describe('generateLegalDocument', () => {
    it('should generate legal document successfully', async () => {
      const clientId = 'client-123';
      const documentType = 'sale_agreement';
      const context = 'Selling a car to a friend';
      const language = 'en';

      const mockDocumentResponse = {
        document: 'SALE AGREEMENT...',
        instructions: 'Fill in the blanks...',
        placeholders: ['buyer_name', 'seller_name', 'car_details'],
        legalNotes: 'This is a legal document...',
      };

      mockGeminiAIService.generateLegalDocument.mockResolvedValue(
        mockDocumentResponse,
      );

      const result = await service.generateLegalDocument(
        clientId,
        documentType,
        context,
        language,
      );

      expect(result).toEqual({
        ...mockDocumentResponse,
        metadata: expect.objectContaining({
          clientId,
          documentType,
          language,
          generatedAt: expect.any(String),
        }),
      });
    });

    it('should handle document generation failure', async () => {
      const clientId = 'client-123';
      const documentType = 'sale_agreement';
      const context = 'Selling a car to a friend';

      mockGeminiAIService.generateLegalDocument.mockRejectedValue(
        new Error('AI service error'),
      );

      await expect(
        service.generateLegalDocument(clientId, documentType, context),
      ).rejects.toThrow('Failed to generate legal document: AI service error');
    });
  });

  describe('generateLawyerRecommendations', () => {
    it('should generate lawyer recommendations successfully', async () => {
      const clientId = 'client-123';
      const caseDetails = 'Property boundary dispute';
      const jurisdiction = 'Lagos State, Nigeria';
      const practiceArea = 'Property Law';
      const language = 'en';

      const mockRecommendations = {
        requirements: { experience: '5+ years' },
        selectionCriteria: { cost: 'affordable' },
        verificationChecklist: ['Call to bar certificate'],
        interviewQuestions: ['What is your experience?'],
        nextSteps: ['Contact recommended lawyers'],
      };

      mockGeminiAIService.generateLawyerRecommendations.mockResolvedValue(
        mockRecommendations,
      );

      const result = await service.generateLawyerRecommendations(
        clientId,
        caseDetails,
        jurisdiction,
        practiceArea,
        language,
      );

      expect(result).toEqual({
        ...mockRecommendations,
        metadata: expect.objectContaining({
          clientId,
          jurisdiction,
          practiceArea,
          language,
          generatedAt: expect.any(String),
        }),
      });
    });
  });

  describe('generateLawReports', () => {
    it('should generate law reports successfully', async () => {
      const topic = 'Property Law';
      const jurisdiction = 'Nigeria';
      const language = 'en';

      const mockReports = 'Recent developments in property law...';

      mockGeminiAIService.generateLawReports.mockResolvedValue(mockReports);

      const result = await service.generateLawReports(
        topic,
        jurisdiction,
        language,
      );

      expect(result).toEqual({
        reports: mockReports,
        metadata: expect.objectContaining({
          topic,
          jurisdiction,
          language,
          generatedAt: expect.any(String),
        }),
      });
    });
  });

  describe('checkAIServiceHealth', () => {
    it('should return true when AI service is healthy', async () => {
      mockGeminiAIService.healthCheck.mockResolvedValue(true);

      const result = await service.checkAIServiceHealth();

      expect(result).toBe(true);
    });

    it('should return false when AI service is unhealthy', async () => {
      mockGeminiAIService.healthCheck.mockResolvedValue(false);

      const result = await service.checkAIServiceHealth();

      expect(result).toBe(false);
    });

    it('should return false when health check fails', async () => {
      mockGeminiAIService.healthCheck.mockRejectedValue(
        new Error('Health check failed'),
      );

      const result = await service.checkAIServiceHealth();

      expect(result).toBe(false);
    });
  });

  describe('calculateConsultationFee', () => {
    it('should calculate correct fees for different consultation types', () => {
      const initialFee = (service as any).calculateConsultationFee('INITIAL');
      const followUpFee = (service as any).calculateConsultationFee(
        'FOLLOW_UP',
      );
      const specialistFee = (service as any).calculateConsultationFee(
        'SPECIALIST',
      );
      const defaultFee = (service as any).calculateConsultationFee();

      expect(initialFee).toBe(5000);
      expect(followUpFee).toBe(3000);
      expect(specialistFee).toBe(10000);
      expect(defaultFee).toBe(5000);
    });
  });
});
