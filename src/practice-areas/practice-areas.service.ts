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

    // Add lawyer to practice area
    if (!practiceArea.lawyers) {
      practiceArea.lawyers = [];
    }

    // Note: This would need to be implemented with proper lawyer profile loading
    // For now, we'll just increment the count
    practiceArea.lawyerCount += 1;

    return this.practiceAreaRepository.save(practiceArea);
  }

  async removeLawyer(practiceAreaId: string, lawyerProfileId: string) {
    const practiceArea = await this.findById(practiceAreaId);

    if (practiceArea.lawyerCount > 0) {
      practiceArea.lawyerCount -= 1;
    }

    return this.practiceAreaRepository.save(practiceArea);
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
}
