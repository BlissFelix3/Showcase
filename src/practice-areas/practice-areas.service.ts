import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PracticeAreaRepository } from './repositories/practice-area.repository';
import {
  PracticeAreaCategory,
  PracticeArea,
} from './entities/practice-area.entity';

@Injectable()
export class PracticeAreasService {
  constructor(
    private readonly practiceAreaRepository: PracticeAreaRepository,
  ) {}

  async create(data: {
    name: string;
    description?: string;
    category: PracticeAreaCategory;
    language?: string;
  }) {
    const practiceArea = this.practiceAreaRepository.create({
      ...data,
      language: data.language || 'en',
    });

    return this.practiceAreaRepository.save(practiceArea);
  }

  async findAll(category?: PracticeAreaCategory, language?: string) {
    const where: any = { isActive: true };
    if (category) {
      where.category = category;
    }
    if (language) {
      where.language = language;
    }

    return this.practiceAreaRepository.find({
      where,
      order: { name: 'ASC' },
    });
  }

  async findById(id: string) {
    const practiceArea = await this.practiceAreaRepository.findOne({
      where: { id },
      relations: ['lawyers'],
    });

    if (!practiceArea) {
      throw new NotFoundException('Practice area not found');
    }

    return practiceArea;
  }

  async update(id: string, data: Partial<PracticeArea>) {
    const practiceArea = await this.findById(id);

    Object.assign(practiceArea, data);
    return this.practiceAreaRepository.save(practiceArea);
  }

  async delete(id: string) {
    const practiceArea = await this.findById(id);
    practiceArea.isActive = false;
    return this.practiceAreaRepository.save(practiceArea);
  }

  async addLawyer(practiceAreaId: string, lawyerProfileId: string) {
    const practiceArea = await this.findById(practiceAreaId);

    // Check if lawyer is already added
    const existingLawyer = practiceArea.lawyers?.find(
      (lawyer) => lawyer.id === lawyerProfileId,
    );
    if (existingLawyer) {
      throw new BadRequestException(
        'Lawyer already added to this practice area',
      );
    }

    // Load the lawyer profile to add to the practice area
    const lawyerProfile = await this.practiceAreaRepository.manager
      .getRepository('LawyerProfile')
      .findOne({ where: { id: lawyerProfileId } });

    if (!lawyerProfile) {
      throw new NotFoundException('Lawyer profile not found');
    }

    // Add lawyer to practice area
    if (!practiceArea.lawyers) {
      practiceArea.lawyers = [];
    }

    // Add the lawyer profile to the practice area
    practiceArea.lawyers.push(lawyerProfile as any);
    practiceArea.lawyerCount = practiceArea.lawyers.length;

    // Save the updated practice area
    const updatedPracticeArea =
      await this.practiceAreaRepository.save(practiceArea);

    // Update the lawyer profile's practice areas
    await this.practiceAreaRepository.manager
      .getRepository('LawyerProfile')
      .createQueryBuilder()
      .relation('practiceAreaEntities')
      .of(lawyerProfileId)
      .add(practiceAreaId);

    return updatedPracticeArea;
  }

  async removeLawyer(practiceAreaId: string, lawyerProfileId: string) {
    const practiceArea = await this.findById(practiceAreaId);

    // Check if lawyer exists in this practice area
    const existingLawyerIndex = practiceArea.lawyers?.findIndex(
      (lawyer) => lawyer.id === lawyerProfileId,
    );

    if (existingLawyerIndex === -1 || existingLawyerIndex === undefined) {
      throw new BadRequestException(
        'Lawyer is not associated with this practice area',
      );
    }

    // Remove lawyer from practice area
    practiceArea.lawyers.splice(existingLawyerIndex, 1);
    practiceArea.lawyerCount = practiceArea.lawyers.length;

    // Save the updated practice area
    const updatedPracticeArea =
      await this.practiceAreaRepository.save(practiceArea);

    // Update the lawyer profile's practice areas
    await this.practiceAreaRepository.manager
      .getRepository('LawyerProfile')
      .createQueryBuilder()
      .relation('practiceAreaEntities')
      .of(lawyerProfileId)
      .remove(practiceAreaId);

    return updatedPracticeArea;
  }

  async getPopularPracticeAreas(limit: number = 10) {
    return this.practiceAreaRepository.find({
      where: { isActive: true },
      order: { lawyerCount: 'DESC' },
      take: limit,
    });
  }

  async searchPracticeAreas(query: string, language?: string) {
    const where: any = { isActive: true };
    if (language) {
      where.language = language;
    }

    return this.practiceAreaRepository
      .createQueryBuilder('practiceArea')
      .where('practiceArea.isActive = :isActive', { isActive: true })
      .andWhere(
        '(practiceArea.name ILIKE :query OR practiceArea.description ILIKE :query)',
        { query: `%${query}%` },
      )
      .andWhere(language ? 'practiceArea.language = :language' : '1=1', {
        language,
      })
      .orderBy('practiceArea.name', 'ASC')
      .getMany();
  }

  async getPracticeAreasByLawyerCount(minCount: number = 0, maxCount?: number) {
    const queryBuilder = this.practiceAreaRepository
      .createQueryBuilder('practiceArea')
      .where('practiceArea.isActive = :isActive', { isActive: true })
      .andWhere('practiceArea.lawyerCount >= :minCount', { minCount });

    if (maxCount !== undefined) {
      queryBuilder.andWhere('practiceArea.lawyerCount <= :maxCount', {
        maxCount,
      });
    }

    return queryBuilder
      .orderBy('practiceArea.lawyerCount', 'DESC')
      .addOrderBy('practiceArea.name', 'ASC')
      .getMany();
  }

  async getPracticeAreasWithLawyerDetails(limit: number = 20) {
    return this.practiceAreaRepository
      .createQueryBuilder('practiceArea')
      .leftJoinAndSelect('practiceArea.lawyers', 'lawyer')
      .leftJoinAndSelect('lawyer.user', 'user')
      .where('practiceArea.isActive = :isActive', { isActive: true })
      .andWhere('practiceArea.lawyerCount > 0')
      .orderBy('practiceArea.lawyerCount', 'DESC')
      .addOrderBy('practiceArea.name', 'ASC')
      .limit(limit)
      .getMany();
  }

  async updatePracticeAreaStatistics(practiceAreaId: string) {
    const practiceArea = await this.findById(practiceAreaId);

    // Count active lawyers in this practice area
    const activeLawyerCount = await this.practiceAreaRepository.manager
      .getRepository('LawyerProfile')
      .count({
        where: {
          practiceAreaEntities: { id: practiceAreaId },
          verificationStatus: 'APPROVED',
        },
      });

    // Update the practice area with accurate count
    practiceArea.lawyerCount = activeLawyerCount;

    return this.practiceAreaRepository.save(practiceArea);
  }

  async getPracticeAreaTrends(days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return this.practiceAreaRepository
      .createQueryBuilder('practiceArea')
      .select([
        'practiceArea.id',
        'practiceArea.name',
        'practiceArea.lawyerCount',
        'practiceArea.category',
      ])
      .where('practiceArea.isActive = :isActive', { isActive: true })
      .andWhere('practiceArea.updatedAt >= :startDate', { startDate })
      .orderBy('practiceArea.lawyerCount', 'DESC')
      .addOrderBy('practiceArea.updatedAt', 'DESC')
      .getMany();
  }

  async bulkUpdatePracticeAreaCounts() {
    const practiceAreas = await this.practiceAreaRepository.find({
      where: { isActive: true },
    });

    const updatePromises = practiceAreas.map(async (practiceArea) => {
      const lawyerCount = await this.practiceAreaRepository.manager
        .getRepository('LawyerProfile')
        .count({
          where: {
            practiceAreaEntities: { id: practiceArea.id },
            verificationStatus: 'APPROVED',
          },
        });

      if (practiceArea.lawyerCount !== lawyerCount) {
        practiceArea.lawyerCount = lawyerCount;
        return this.practiceAreaRepository.save(practiceArea);
      }
      return practiceArea;
    });

    return Promise.all(updatePromises);
  }
}
