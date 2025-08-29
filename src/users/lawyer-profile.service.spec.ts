import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ConfigService } from '@nestjs/config';
import { LawyerProfileService } from './lawyer-profile.service';
import { LawyerProfileRepository } from './repositories/lawyer-profile.repository';
import { VerificationDocumentRepository } from './repositories/verification-document.repository';
import { LawyerReviewRepository } from './repositories/lawyer-review.repository';
import { FileUploadService } from './file-upload.service';
import { PracticeAreaAssignmentService } from '../practice-areas/practice-area-assignment.service';
import { LocalEvents } from '../utils/constants';

describe('LawyerProfileService', () => {
  let service: LawyerProfileService;
  let lawyerProfileRepository: LawyerProfileRepository;
  let verificationDocumentRepository: VerificationDocumentRepository;
  let lawyerReviewRepository: LawyerReviewRepository;
  let eventEmitter: EventEmitter2;

  const mockLawyerProfileRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    createQueryBuilder: jest.fn(),
    findAndCount: jest.fn(),
    find: jest.fn(),
  };

  const mockVerificationDocumentRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    count: jest.fn(),
  };

  const mockLawyerReviewRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    count: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockEventEmitter = {
    emit: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn().mockReturnValue('http://localhost:3000'),
  };

  const mockFileUploadService = {
    processUploadedFile: jest.fn(),
  };

  const mockPracticeAreaAssignmentService = {
    validatePracticeAreaAssignment: jest.fn(),
    assignPracticeAreasToLawyer: jest.fn(),
    removePracticeAreaFromLawyer: jest.fn(),
    getLawyerPracticeAreas: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LawyerProfileService,
        {
          provide: LawyerProfileRepository,
          useValue: mockLawyerProfileRepository,
        },
        {
          provide: VerificationDocumentRepository,
          useValue: mockVerificationDocumentRepository,
        },
        {
          provide: LawyerReviewRepository,
          useValue: mockLawyerReviewRepository,
        },
        {
          provide: EventEmitter2,
          useValue: mockEventEmitter,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: FileUploadService,
          useValue: mockFileUploadService,
        },
        {
          provide: PracticeAreaAssignmentService,
          useValue: mockPracticeAreaAssignmentService,
        },
      ],
    }).compile();

    service = module.get<LawyerProfileService>(LawyerProfileService);
    lawyerProfileRepository = module.get<LawyerProfileRepository>(
      LawyerProfileRepository,
    );
    verificationDocumentRepository = module.get<VerificationDocumentRepository>(
      VerificationDocumentRepository,
    );
    lawyerReviewRepository = module.get<LawyerReviewRepository>(
      LawyerReviewRepository,
    );
    eventEmitter = module.get<EventEmitter2>(EventEmitter2);
    mockFileUploadService.processUploadedFile.mockResolvedValue({
      fileName: 'document.pdf',
      fileUrl:
        'http://localhost:3000/uploads/verification-documents/document.pdf',
      originalName: 'original.pdf',
      mimeType: 'application/pdf',
      fileSize: 1024,
    });

    mockPracticeAreaAssignmentService.validatePracticeAreaAssignment.mockResolvedValue(
      {
        isValid: true,
        errors: [],
        warnings: [],
      },
    );

    mockPracticeAreaAssignmentService.assignPracticeAreasToLawyer.mockResolvedValue(
      {
        id: 'lawyer-123',
        practiceAreas: ['pa-1', 'pa-2'],
      },
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getLawyerProfile', () => {
    it('should return lawyer profile with relations', async () => {
      const mockProfile = {
        id: 'lawyer-123',
        fullName: 'John Doe',
        verificationStatus: 'APPROVED',
      };

      mockLawyerProfileRepository.findOne.mockResolvedValue(mockProfile);

      const result = await service.getLawyerProfile('lawyer-123');

      expect(result).toEqual(mockProfile);
      expect(mockLawyerProfileRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'lawyer-123' },
        relations: [
          'user',
          'practiceAreaEntities',
          'reviews',
          'verificationDocuments',
          'jurisdiction',
        ],
      });
    });

    it('should throw NotFoundException when profile not found', async () => {
      mockLawyerProfileRepository.findOne.mockResolvedValue(null);

      await expect(service.getLawyerProfile('nonexistent')).rejects.toThrow(
        'Lawyer profile not found',
      );
    });
  });

  describe('getPublicLawyerProfile', () => {
    it('should return public profile for approved lawyer', async () => {
      const mockProfile = {
        id: 'lawyer-123',
        fullName: 'John Doe',
        verificationStatus: 'APPROVED',
        verificationDocuments: ['doc1', 'doc2'],
        verificationNotes: 'Some notes',
        verifiedBy: 'admin-123',
      };

      mockLawyerProfileRepository.findOne.mockResolvedValue(mockProfile);

      const result = await service.getPublicLawyerProfile('lawyer-123');

      expect(result.verificationDocuments).toBeUndefined();
      expect(result.verificationNotes).toBeUndefined();
      expect(result.verifiedBy).toBeUndefined();
    });

    it('should throw ForbiddenException for unverified lawyer', async () => {
      const mockProfile = {
        id: 'lawyer-123',
        verificationStatus: 'PENDING',
      };

      mockLawyerProfileRepository.findOne.mockResolvedValue(mockProfile);

      await expect(
        service.getPublicLawyerProfile('lawyer-123'),
      ).rejects.toThrow('Lawyer profile not yet verified');
    });
  });

  describe('updateLawyerProfile', () => {
    it('should update lawyer profile successfully', async () => {
      const mockProfile = {
        id: 'lawyer-123',
        fullName: 'John Doe',
        phone: '+2348012345678',
      };

      const updateData = {
        fullName: 'John Smith',
        bio: 'Experienced lawyer',
        yearsOfExperience: 10,
      };

      mockLawyerProfileRepository.findOne.mockResolvedValue(mockProfile);
      mockLawyerProfileRepository.save.mockResolvedValue({
        ...mockProfile,
        ...updateData,
      });

      const result = await service.updateLawyerProfile(
        'lawyer-123',
        updateData,
      );

      expect(result.fullName).toBe('John Smith');
      expect(result.bio).toBe('Experienced lawyer');
      expect(result.yearsOfExperience).toBe(10);
    });
  });

  describe('uploadVerificationDocument', () => {
    it('should upload verification document successfully', async () => {
      const mockProfile = {
        id: 'lawyer-123',
        verificationStatus: 'APPROVED',
      };

      const mockFile = {
        filename: 'document.pdf',
        path: '/uploads/document.pdf',
        originalname: 'original.pdf',
        mimetype: 'application/pdf',
        size: 1024,
      };

      const uploadData = {
        documentType: 'CALL_TO_BAR_CERTIFICATE',
        isPrimary: true,
      };

      mockLawyerProfileRepository.findOne.mockResolvedValue(mockProfile);
      mockVerificationDocumentRepository.findOne.mockResolvedValue(null);
      mockVerificationDocumentRepository.create.mockReturnValue({
        id: 'doc-123',
        ...uploadData,
      });
      mockVerificationDocumentRepository.save.mockResolvedValue({
        id: 'doc-123',
        ...uploadData,
      });

      const result = await service.uploadVerificationDocument(
        'lawyer-123',
        uploadData,
        mockFile as any,
      );

      expect(result).toBeDefined();
      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        LocalEvents.VERIFICATION_DOCUMENT_UPLOADED,
        expect.objectContaining({
          lawyerId: 'lawyer-123',
          documentType: 'CALL_TO_BAR_CERTIFICATE',
        }),
      );
    });
  });

  describe('createReview', () => {
    it('should create review successfully', async () => {
      const mockProfile = {
        id: 'lawyer-123',
        fullName: 'John Doe',
      };

      const reviewData = {
        rating: 5,
        comment: 'Excellent lawyer',
        caseType: 'Property Law',
        caseOutcome: 'Successful',
      };

      mockLawyerProfileRepository.findOne.mockResolvedValue(mockProfile);
      mockLawyerReviewRepository.findOne.mockResolvedValue(null);
      mockLawyerReviewRepository.create.mockReturnValue({
        id: 'review-123',
        ...reviewData,
      });
      mockLawyerReviewRepository.save.mockResolvedValue({
        id: 'review-123',
        ...reviewData,
      });

      mockLawyerReviewRepository.find.mockResolvedValue([
        { rating: 5 },
        { rating: 4 },
      ]);

      const result = await service.createReview(
        'client-123',
        'lawyer-123',
        reviewData,
      );

      expect(result).toBeDefined();
      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        LocalEvents.LAWYER_REVIEW_CREATED,
        expect.objectContaining({
          lawyerId: 'lawyer-123',
          clientId: 'client-123',
          rating: 5,
        }),
      );
    });

    it('should throw error if client already reviewed', async () => {
      const mockProfile = { id: 'lawyer-123' };
      const existingReview = { id: 'review-123' };

      mockLawyerProfileRepository.findOne.mockResolvedValue(mockProfile);
      mockLawyerReviewRepository.findOne.mockResolvedValue(existingReview);

      await expect(
        service.createReview('client-123', 'lawyer-123', { rating: 5 }),
      ).rejects.toThrow('You have already reviewed this lawyer');
    });
  });

  describe('verifyLawyer', () => {
    it('should approve lawyer successfully', async () => {
      const mockProfile = {
        id: 'lawyer-123',
        verificationStatus: 'PENDING',
      };

      const mockDocuments = [
        { documentType: 'CALL_TO_BAR_CERTIFICATE', status: 'APPROVED' },
        { documentType: 'NATIONAL_ID', status: 'APPROVED' },
      ];

      const verificationData = {
        action: 'APPROVE',
        verificationNotes: 'All documents verified',
      };

      mockLawyerProfileRepository.findOne.mockResolvedValue(mockProfile);
      mockVerificationDocumentRepository.find.mockResolvedValue(mockDocuments);
      mockLawyerProfileRepository.save.mockResolvedValue({
        ...mockProfile,
        verificationStatus: 'APPROVED',
        verifiedAt: expect.any(Date),
        verifiedBy: 'admin-123',
      });

      const result = await service.verifyLawyer(
        'lawyer-123',
        'admin-123',
        verificationData,
      );

      expect(result.verificationStatus).toBe('APPROVED');
      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        LocalEvents.LAWYER_VERIFICATION_STATUS_CHANGED,
        expect.objectContaining({
          lawyerId: 'lawyer-123',
          status: 'APPROVE',
          adminId: 'admin-123',
        }),
      );
    });

    it('should reject lawyer verification', async () => {
      const mockProfile = {
        id: 'lawyer-123',
        verificationStatus: 'PENDING',
      };

      const verificationData = {
        action: 'REJECT',
        verificationNotes: 'Documents incomplete',
        rejectionReason: 'Missing required documents',
      };

      mockLawyerProfileRepository.findOne.mockResolvedValue(mockProfile);
      mockLawyerProfileRepository.save.mockResolvedValue({
        ...mockProfile,
        verificationStatus: 'REJECTED',
        verificationNotes: 'Documents incomplete',
      });

      const result = await service.verifyLawyer(
        'lawyer-123',
        'admin-123',
        verificationData,
      );

      expect(result.verificationStatus).toBe('REJECTED');
    });
  });

  describe('getLawyersForMatching', () => {
    it('should return matching lawyers', async () => {
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([
          { id: 'lawyer-1', fullName: 'John Doe' },
          { id: 'lawyer-2', fullName: 'Jane Smith' },
        ]),
      };

      mockLawyerProfileRepository.createQueryBuilder.mockReturnValue(
        mockQueryBuilder,
      );

      const result = await service.getLawyersForMatching(
        'Lagos State',
        'Property Law',
        undefined,
        10,
      );

      expect(result).toHaveLength(2);
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'profile.verificationStatus = :status',
        { status: 'APPROVED' },
      );
    });
  });

  describe('getVerificationQueue', () => {
    it('should return verification queue', async () => {
      const mockProfiles = [
        { id: 'lawyer-1', verificationStatus: 'PENDING' },
        { id: 'lawyer-2', verificationStatus: 'PENDING' },
      ];

      mockLawyerProfileRepository.findAndCount.mockResolvedValue([
        mockProfiles,
        2,
      ]);

      const result = await service.getVerificationQueue(1, 20);

      expect(result.profiles).toEqual(mockProfiles);
      expect(result.total).toBe(2);
      expect(result.totalPages).toBe(1);
    });
  });

  describe('getLawyerStats', () => {
    it('should return lawyer statistics', async () => {
      const mockProfile = {
        id: 'lawyer-123',
        totalCases: 50,
        successfulCases: 45,
      };

      mockLawyerProfileRepository.findOne.mockResolvedValue(mockProfile);
      mockLawyerReviewRepository.count.mockResolvedValue(25);
      mockVerificationDocumentRepository.count.mockResolvedValue(5);
      mockLawyerReviewRepository.createQueryBuilder.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([
          { rating: 5, count: 15 },
          { rating: 4, count: 10 },
        ]),
      });

      const result = await service.getLawyerStats('lawyer-123');

      expect(result.stats.totalReviews).toBe(25);
      expect(result.stats.totalDocuments).toBe(5);
      expect(result.stats.successRate).toBe(90);
    });
  });
});
