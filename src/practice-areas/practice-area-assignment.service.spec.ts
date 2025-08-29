import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PracticeAreaAssignmentService } from './practice-area-assignment.service';
import { PracticeAreaRepository } from './repositories/practice-area.repository';
import { LawyerProfileRepository } from '../users/repositories/lawyer-profile.repository';
import { LocalEvents } from '../utils/constants';

describe('PracticeAreaAssignmentService', () => {
  let service: PracticeAreaAssignmentService;
  let practiceAreaRepository: PracticeAreaRepository;
  let lawyerProfileRepository: LawyerProfileRepository;
  let eventEmitter: EventEmitter2;

  const mockPracticeAreaRepository = {
    findByIds: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockLawyerProfileRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
    count: jest.fn(),
    findAndCount: jest.fn(),
    find: jest.fn(),
  };

  const mockEventEmitter = {
    emit: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PracticeAreaAssignmentService,
        {
          provide: PracticeAreaRepository,
          useValue: mockPracticeAreaRepository,
        },
        {
          provide: LawyerProfileRepository,
          useValue: mockLawyerProfileRepository,
        },
        {
          provide: EventEmitter2,
          useValue: mockEventEmitter,
        },
      ],
    }).compile();

    service = module.get<PracticeAreaAssignmentService>(
      PracticeAreaAssignmentService,
    );
    practiceAreaRepository = module.get<PracticeAreaRepository>(
      PracticeAreaRepository,
    );
    lawyerProfileRepository = module.get<LawyerProfileRepository>(
      LawyerProfileRepository,
    );
    eventEmitter = module.get<EventEmitter2>(EventEmitter2);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  describe('assignPracticeAreasToLawyer', () => {
    it('should assign practice areas to lawyer successfully', async () => {
      const lawyerId = 'lawyer-123';
      const practiceAreaIds = ['pa-1', 'pa-2'];

      const mockLawyerProfile = {
        id: lawyerId,
        practiceAreaEntities: [],
        practiceAreas: [],
      };

      const mockPracticeAreas = [
        { id: 'pa-1', name: 'Property Law' },
        { id: 'pa-2', name: 'Corporate Law' },
      ];

      mockLawyerProfileRepository.findOne.mockResolvedValue(mockLawyerProfile);
      mockPracticeAreaRepository.findByIds.mockResolvedValue(mockPracticeAreas);
      mockLawyerProfileRepository.save.mockResolvedValue({
        ...mockLawyerProfile,
        practiceAreaEntities: mockPracticeAreas,
        practiceAreas: practiceAreaIds,
      });
      mockLawyerProfileRepository.count.mockResolvedValue(5);

      const result = await service.assignPracticeAreasToLawyer(
        lawyerId,
        practiceAreaIds,
      );

      expect(result.practiceAreaEntities).toEqual(mockPracticeAreas);
      expect(result.practiceAreas).toEqual(practiceAreaIds);
      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        LocalEvents.LAWYER_PRACTICE_AREAS_UPDATED,
        expect.objectContaining({
          lawyerId,
          practiceAreaIds,
        }),
      );
    });

    it('should throw error when practice areas not found', async () => {
      const lawyerId = 'lawyer-123';
      const practiceAreaIds = ['pa-1', 'pa-2'];

      const mockLawyerProfile = { id: lawyerId };
      const mockPracticeAreas = [{ id: 'pa-1', name: 'Property Law' }];

      mockLawyerProfileRepository.findOne.mockResolvedValue(mockLawyerProfile);
      mockPracticeAreaRepository.findByIds.mockResolvedValue(mockPracticeAreas);

      await expect(
        service.assignPracticeAreasToLawyer(lawyerId, practiceAreaIds),
      ).rejects.toThrow('Practice areas not found: pa-2');
    });

    it('should throw error when lawyer profile not found', async () => {
      const lawyerId = 'lawyer-123';
      const practiceAreaIds = ['pa-1'];

      mockLawyerProfileRepository.findOne.mockResolvedValue(null);

      await expect(
        service.assignPracticeAreasToLawyer(lawyerId, practiceAreaIds),
      ).rejects.toThrow('Lawyer profile not found');
    });
  });

  describe('removePracticeAreaFromLawyer', () => {
    it('should remove practice area from lawyer successfully', async () => {
      const lawyerId = 'lawyer-123';
      const practiceAreaId = 'pa-1';

      const mockLawyerProfile = {
        id: lawyerId,
        practiceAreaEntities: [
          { id: 'pa-1', name: 'Property Law' },
          { id: 'pa-2', name: 'Corporate Law' },
        ],
        practiceAreas: ['pa-1', 'pa-2'],
      };

      const mockPracticeArea = { id: 'pa-1', name: 'Property Law' };

      // Set up mocks for this specific test
      mockLawyerProfileRepository.findOne.mockImplementation((options) => {
        if (options?.where?.id === lawyerId) {
          return Promise.resolve(mockLawyerProfile);
        }
        if (options?.where?.id === practiceAreaId) {
          return Promise.resolve(mockPracticeArea);
        }
        return Promise.resolve(null);
      });
      mockPracticeAreaRepository.findOne.mockResolvedValue(mockPracticeArea);

      mockLawyerProfileRepository.save.mockResolvedValue({
        ...mockLawyerProfile,
        practiceAreaEntities: [{ id: 'pa-2', name: 'Corporate Law' }],
        practiceAreas: ['pa-2'],
      });

      mockLawyerProfileRepository.count.mockResolvedValue(4);

      const result = await service.removePracticeAreaFromLawyer(
        lawyerId,
        practiceAreaId,
      );

      expect(result.practiceAreaEntities).toHaveLength(1);
      expect(result.practiceAreas).toHaveLength(1);
      expect(result.practiceAreas).not.toContain(practiceAreaId);
      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        LocalEvents.LAWYER_PRACTICE_AREAS_UPDATED,
        expect.objectContaining({
          lawyerId,
          removedPracticeAreaId: practiceAreaId,
        }),
      );
    });
  });

  describe('getLawyerPracticeAreas', () => {
    it('should return lawyer practice areas', async () => {
      const lawyerId = 'lawyer-123';
      const mockPracticeAreas = [
        { id: 'pa-1', name: 'Property Law' },
        { id: 'pa-2', name: 'Corporate Law' },
      ];

      const mockLawyerProfile = {
        id: lawyerId,
        practiceAreaEntities: mockPracticeAreas,
      };

      // Clear any previous mocks and set up fresh
      mockLawyerProfileRepository.findOne.mockClear();
      mockLawyerProfileRepository.findOne.mockResolvedValue(mockLawyerProfile);

      const result = await service.getLawyerPracticeAreas(lawyerId);

      expect(result).toEqual(mockPracticeAreas);
    });
  });

  describe('getLawyersByPracticeArea', () => {
    it('should return lawyers by practice area with pagination', async () => {
      const practiceAreaId = 'pa-1';
      const mockLawyers = [
        { id: 'lawyer-1', fullName: 'John Doe' },
        { id: 'lawyer-2', fullName: 'Jane Smith' },
      ];

      const mockPracticeArea = { id: practiceAreaId, name: 'Property Law' };

      mockPracticeAreaRepository.findOne.mockResolvedValue(mockPracticeArea);
      mockLawyerProfileRepository.findAndCount.mockResolvedValue([
        mockLawyers,
        2,
      ]);

      const result = await service.getLawyersByPracticeArea(
        practiceAreaId,
        10,
        0,
      );

      expect(result.lawyers).toEqual(mockLawyers);
      expect(result.total).toBe(2);
    });
  });

  describe('getPracticeAreaStatistics', () => {
    it('should return practice area statistics', async () => {
      const practiceAreaId = 'pa-1';
      const mockLawyers = [
        { ratingAverage: 4.5, yearsOfExperience: 10 },
        { ratingAverage: 4.8, yearsOfExperience: 15 },
      ];

      const mockPracticeArea = { id: practiceAreaId, name: 'Property Law' };

      mockPracticeAreaRepository.findOne.mockResolvedValue(mockPracticeArea);
      mockLawyerProfileRepository.find
        .mockResolvedValueOnce(mockLawyers)
        .mockResolvedValueOnce([
          { id: 'lawyer-1', fullName: 'John Doe' },
          { id: 'lawyer-2', fullName: 'Jane Smith' },
        ]);

      const result = await service.getPracticeAreaStatistics(practiceAreaId);

      expect(result.totalLawyers).toBe(2);
      expect(result.averageRating).toBe(4.65);
      expect(result.averageExperience).toBe(12.5);
      expect(result.topLawyers).toHaveLength(2);
    });

    it('should return zero statistics when no lawyers found', async () => {
      const practiceAreaId = 'pa-1';
      const mockPracticeArea = { id: practiceAreaId, name: 'Property Law' };

      mockPracticeAreaRepository.findOne.mockResolvedValue(mockPracticeArea);
      mockLawyerProfileRepository.find.mockResolvedValue([]);

      const result = await service.getPracticeAreaStatistics(practiceAreaId);

      expect(result.totalLawyers).toBe(0);
      expect(result.averageRating).toBe(0);
      expect(result.averageExperience).toBe(0);
      expect(result.topLawyers).toHaveLength(0);
    });
  });

  describe('validatePracticeAreaAssignment', () => {
    it('should return valid when all checks pass', async () => {
      const lawyerId = 'lawyer-123';
      const practiceAreaIds = ['pa-1', 'pa-2'];

      const mockLawyerProfile = { id: lawyerId };
      const mockPracticeAreas = [
        { id: 'pa-1', name: 'Property Law', isActive: true },
        { id: 'pa-2', name: 'Corporate Law', isActive: true },
      ];

      mockLawyerProfileRepository.findOne.mockResolvedValue(mockLawyerProfile);
      mockPracticeAreaRepository.findByIds.mockResolvedValue(mockPracticeAreas);
      mockLawyerProfileRepository.findOne.mockResolvedValue({
        practiceAreaEntities: [],
      });

      const result = await service.validatePracticeAreaAssignment(
        lawyerId,
        practiceAreaIds,
      );

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.warnings).toHaveLength(0);
    });

    it('should return invalid when lawyer not found', async () => {
      const lawyerId = 'lawyer-123';
      const practiceAreaIds = ['pa-1'];

      mockLawyerProfileRepository.findOne.mockResolvedValue(null);

      const result = await service.validatePracticeAreaAssignment(
        lawyerId,
        practiceAreaIds,
      );

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Lawyer profile not found');
    });

    it('should return invalid when practice areas not found', async () => {
      const lawyerId = 'lawyer-123';
      const practiceAreaIds = ['pa-1', 'pa-2'];

      const mockLawyerProfile = { id: lawyerId };
      const mockPracticeAreas = [
        { id: 'pa-1', name: 'Property Law', isActive: true },
      ];

      mockLawyerProfileRepository.findOne.mockResolvedValue(mockLawyerProfile);
      mockPracticeAreaRepository.findByIds.mockResolvedValue(mockPracticeAreas);

      const result = await service.validatePracticeAreaAssignment(
        lawyerId,
        practiceAreaIds,
      );

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Practice areas not found: pa-2');
    });

    it('should return invalid when exceeding maximum practice areas', async () => {
      const lawyerId = 'lawyer-123';
      const practiceAreaIds = Array.from({ length: 11 }, (_, i) => `pa-${i}`);

      const mockLawyerProfile = { id: lawyerId };
      const mockPracticeAreas = practiceAreaIds.map((id) => ({
        id,
        name: `Practice Area ${id}`,
        isActive: true,
      }));

      mockLawyerProfileRepository.findOne.mockResolvedValue(mockLawyerProfile);
      mockPracticeAreaRepository.findByIds.mockResolvedValue(mockPracticeAreas);

      const result = await service.validatePracticeAreaAssignment(
        lawyerId,
        practiceAreaIds,
      );

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        'Maximum practice areas allowed: 10. Requested: 11',
      );
    });
  });

  describe('searchPracticeAreasForLawyer', () => {
    it('should search practice areas with query', async () => {
      const query = 'property';
      const mockPracticeAreas = [
        { id: 'pa-1', name: 'Property Law' },
        { id: 'pa-2', name: 'Real Property' },
      ];

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockPracticeAreas),
      };

      mockPracticeAreaRepository.createQueryBuilder.mockReturnValue(
        mockQueryBuilder,
      );

      const result = await service.searchPracticeAreasForLawyer(query);

      expect(result).toEqual(mockPracticeAreas);
    });
  });
});
