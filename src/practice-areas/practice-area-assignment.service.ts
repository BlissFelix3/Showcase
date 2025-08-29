import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PracticeAreaRepository } from './repositories/practice-area.repository';
import { LawyerProfile } from '../users/entities/lawyer-profile.entity';
import { PracticeArea } from './entities/practice-area.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { LocalEvents } from '../utils/constants';

@Injectable()
export class PracticeAreaAssignmentService {
  private readonly logger = new Logger(PracticeAreaAssignmentService.name);

  constructor(
    private readonly practiceAreaRepository: PracticeAreaRepository,
    @InjectRepository(LawyerProfile)
    private readonly lawyerProfileRepository: Repository<LawyerProfile>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async assignPracticeAreasToLawyer(
    lawyerProfileId: string,
    practiceAreaIds: string[],
  ): Promise<LawyerProfile> {
    const lawyerProfile = await this.lawyerProfileRepository.findOne({
      where: { id: lawyerProfileId },
      relations: ['practiceAreaEntities'],
    });

    if (!lawyerProfile) {
      throw new NotFoundException('Lawyer profile not found');
    }

    const practiceAreas =
      await this.practiceAreaRepository.findByIds(practiceAreaIds);

    if (practiceAreas.length !== practiceAreaIds.length) {
      const foundIds = practiceAreas.map((pa) => pa.id);
      const missingIds = practiceAreaIds.filter((id) => !foundIds.includes(id));
      throw new BadRequestException(
        `Practice areas not found: ${missingIds.join(', ')}`,
      );
    }

    lawyerProfile.practiceAreaEntities = practiceAreas;

    lawyerProfile.practiceAreas = practiceAreaIds;

    const updatedProfile =
      await this.lawyerProfileRepository.save(lawyerProfile);

    await this.updatePracticeAreaLawyerCounts(practiceAreaIds);

    this.logger.log(
      `Practice areas assigned to lawyer ${lawyerProfileId}: ${practiceAreaIds.join(', ')}`,
    );

    return updatedProfile;
  }

  async removePracticeAreaFromLawyer(
    lawyerProfileId: string,
    practiceAreaId: string,
  ): Promise<LawyerProfile> {
    const lawyerProfile = await this.lawyerProfileRepository.findOne({
      where: { id: lawyerProfileId },
      relations: ['practiceAreaEntities'],
    });

    if (!lawyerProfile) {
      throw new NotFoundException('Lawyer profile not found');
    }

    const practiceArea = await this.practiceAreaRepository.findOne({
      where: { id: practiceAreaId },
    });

    if (!practiceArea) {
      throw new NotFoundException('Practice area not found');
    }

    lawyerProfile.practiceAreaEntities =
      lawyerProfile.practiceAreaEntities?.filter(
        (pa) => pa.id !== practiceAreaId,
      ) || [];

    lawyerProfile.practiceAreas =
      lawyerProfile.practiceAreas?.filter((id) => id !== practiceAreaId) || [];

    const updatedProfile =
      await this.lawyerProfileRepository.save(lawyerProfile);

    await this.updatePracticeAreaLawyerCounts([practiceAreaId]);

    this.logger.log(
      `Practice area ${practiceAreaId} removed from lawyer ${lawyerProfileId}`,
    );

    return updatedProfile;
  }

  async getLawyerPracticeAreas(
    lawyerProfileId: string,
  ): Promise<PracticeArea[]> {
    const lawyerProfile = await this.lawyerProfileRepository.findOne({
      where: { id: lawyerProfileId },
      relations: ['practiceAreaEntities'],
    });

    if (!lawyerProfile) {
      throw new NotFoundException('Lawyer profile not found');
    }

    return lawyerProfile.practiceAreaEntities || [];
  }

  async getLawyersByPracticeArea(
    practiceAreaId: string,
    limit: number = 50,
    offset: number = 0,
  ): Promise<{ lawyers: LawyerProfile[]; total: number }> {
    const practiceArea = await this.practiceAreaRepository.findOne({
      where: { id: practiceAreaId },
      relations: ['lawyers'],
    });

    if (!practiceArea) {
      throw new NotFoundException('Practice area not found');
    }

    const [lawyers, total] = await this.lawyerProfileRepository.findAndCount({
      where: {
        practiceAreaEntities: { id: practiceAreaId },
        verificationStatus: 'APPROVED',
      },
      relations: ['user', 'jurisdiction'],
      order: { ratingAverage: 'DESC', yearsOfExperience: 'DESC' },
      skip: offset,
      take: limit,
    });

    return { lawyers, total };
  }

  async getPracticeAreaStatistics(practiceAreaId: string): Promise<{
    totalLawyers: number;
    averageRating: number;
    averageExperience: number;
    topLawyers: LawyerProfile[];
  }> {
    const practiceArea = await this.practiceAreaRepository.findOne({
      where: { id: practiceAreaId },
      relations: ['lawyers'],
    });

    if (!practiceArea) {
      throw new NotFoundException('Practice area not found');
    }

    const lawyers = await this.lawyerProfileRepository.find({
      where: {
        practiceAreaEntities: { id: practiceAreaId },
        verificationStatus: 'APPROVED',
      },
      select: ['ratingAverage', 'yearsOfExperience'],
    });

    if (lawyers.length === 0) {
      return {
        totalLawyers: 0,
        averageRating: 0,
        averageExperience: 0,
        topLawyers: [],
      };
    }

    const totalLawyers = lawyers.length;
    const averageRating =
      lawyers.reduce((sum, lawyer) => sum + lawyer.ratingAverage, 0) /
      totalLawyers;
    const averageExperience =
      lawyers.reduce((sum, lawyer) => sum + lawyer.yearsOfExperience, 0) /
      totalLawyers;

    const topLawyers = await this.lawyerProfileRepository.find({
      where: {
        practiceAreaEntities: { id: practiceAreaId },
        verificationStatus: 'APPROVED',
      },
      relations: ['user', 'jurisdiction'],
      order: { ratingAverage: 'DESC', yearsOfExperience: 'DESC' },
      take: 10,
    });

    return {
      totalLawyers,
      averageRating,
      averageExperience,
      topLawyers,
    };
  }

  async updatePracticeAreaLawyerCounts(
    practiceAreaIds: string[],
  ): Promise<void> {
    for (const practiceAreaId of practiceAreaIds) {
      const lawyerCount = await this.lawyerProfileRepository.count({
        where: {
          practiceAreaEntities: { id: practiceAreaId },
          verificationStatus: 'APPROVED',
        },
      });

      await this.practiceAreaRepository.update(practiceAreaId, {
        lawyerCount,
      });
    }
  }

  async getPracticeAreasByCategory(
    category: string,
    language: string = 'en',
  ): Promise<PracticeArea[]> {
    return this.practiceAreaRepository.find({
      where: {
        category: category as any,
        language,
        isActive: true,
      },
      order: { name: 'ASC' },
    });
  }

  async getPracticeAreasWithLawyerCounts(): Promise<
    Array<PracticeArea & { activeLawyerCount: number }>
  > {
    const practiceAreas = await this.practiceAreaRepository.find({
      where: { isActive: true },
      order: { lawyerCount: 'DESC', name: 'ASC' },
    });

    return practiceAreas.map((pa) => ({
      ...pa,
      activeLawyerCount: pa.lawyerCount,
    }));
  }

  async searchPracticeAreasForLawyer(
    query: string,
    excludePracticeAreaIds: string[] = [],
    limit: number = 20,
  ): Promise<PracticeArea[]> {
    const queryBuilder = this.practiceAreaRepository
      .createQueryBuilder('practiceArea')
      .where('practiceArea.isActive = :isActive', { isActive: true })
      .andWhere(
        '(practiceArea.name ILIKE :query OR practiceArea.description ILIKE :query)',
        { query: `%${query}%` },
      );

    if (excludePracticeAreaIds.length > 0) {
      queryBuilder.andWhere('practiceArea.id NOT IN (:...excludeIds)', {
        excludeIds: excludePracticeAreaIds,
      });
    }

    return queryBuilder
      .orderBy('practiceArea.name', 'ASC')
      .limit(limit)
      .getMany();
  }

  async validatePracticeAreaAssignment(
    lawyerProfileId: string,
    practiceAreaIds: string[],
  ): Promise<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
  }> {
    const errors: string[] = [];
    const warnings: string[] = [];

    const lawyerProfile = await this.lawyerProfileRepository.findOne({
      where: { id: lawyerProfileId },
    });

    if (!lawyerProfile) {
      errors.push('Lawyer profile not found');
      return { isValid: false, errors, warnings };
    }

    const practiceAreas =
      await this.practiceAreaRepository.findByIds(practiceAreaIds);

    if (practiceAreas.length !== practiceAreaIds.length) {
      const foundIds = practiceAreas.map((pa) => pa.id);
      const missingIds = practiceAreaIds.filter((id) => !foundIds.includes(id));
      errors.push(`Practice areas not found: ${missingIds.join(', ')}`);
    }

    const inactiveAreas = practiceAreas.filter((pa) => !pa.isActive);
    if (inactiveAreas.length > 0) {
      warnings.push(
        `Some practice areas are inactive: ${inactiveAreas
          .map((pa) => pa.name)
          .join(', ')}`,
      );
    }

    const currentPracticeAreas =
      await this.getLawyerPracticeAreas(lawyerProfileId);
    const currentIds = currentPracticeAreas.map((pa) => pa.id);
    const duplicates = practiceAreaIds.filter((id) => currentIds.includes(id));

    if (duplicates.length > 0) {
      warnings.push(
        `Lawyer already has these practice areas: ${duplicates.join(', ')}`,
      );
    }

    const maxPracticeAreas = 10;
    if (practiceAreaIds.length > maxPracticeAreas) {
      errors.push(
        `Maximum practice areas allowed: ${maxPracticeAreas}. Requested: ${practiceAreaIds.length}`,
      );
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }
}
