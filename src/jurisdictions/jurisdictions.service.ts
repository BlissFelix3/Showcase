import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { JurisdictionRepository } from './repositories/jurisdiction.repository';
import {
  JurisdictionType,
  JurisdictionStatus,
  Jurisdiction,
} from './entities/jurisdiction.entity';

@Injectable()
export class JurisdictionsService {
  constructor(
    private readonly jurisdictionRepository: JurisdictionRepository,
  ) {}

  async create(data: {
    name: string;
    code: string;
    type: JurisdictionType;
    parentId?: string;
    description?: string;
    timezone?: string;
    language?: string;
    latitude?: number;
    longitude?: number;
    legalSystem?: any;
    courtStructure?: any;
  }) {
    const existingJurisdiction = await this.jurisdictionRepository.findOne({
      where: { code: data.code },
    });

    if (existingJurisdiction) {
      throw new BadRequestException('Jurisdiction code already exists');
    }

    const jurisdiction = this.jurisdictionRepository.create({
      ...data,
      language: data.language || 'en',
      status: JurisdictionStatus.ACTIVE,
    });

    return this.jurisdictionRepository.save(jurisdiction);
  }

  async findAll(type?: JurisdictionType, status?: JurisdictionStatus) {
    const where: any = {};
    if (type) {
      where.type = type;
    }
    if (status) {
      where.status = status;
    }

    return this.jurisdictionRepository.find({
      where,
      order: { name: 'ASC' },
    });
  }

  async findById(id: string) {
    const jurisdiction = await this.jurisdictionRepository.findOne({
      where: { id },
      relations: ['users', 'cases'],
    });

    if (!jurisdiction) {
      throw new NotFoundException('Jurisdiction not found');
    }

    return jurisdiction;
  }

  async findByCode(code: string) {
    const jurisdiction = await this.jurisdictionRepository.findOne({
      where: { code },
      relations: ['users', 'cases'],
    });

    if (!jurisdiction) {
      throw new NotFoundException('Jurisdiction not found');
    }

    return jurisdiction;
  }

  async update(id: string, updateData: Partial<Jurisdiction>) {
    const jurisdiction = await this.findById(id);

    Object.assign(jurisdiction, updateData);
    return this.jurisdictionRepository.save(jurisdiction);
  }

  async delete(id: string) {
    const jurisdiction = await this.findById(id);
    jurisdiction.status = JurisdictionStatus.INACTIVE;
    return this.jurisdictionRepository.save(jurisdiction);
  }

  async getHierarchy() {
    const jurisdictions = await this.jurisdictionRepository.find({
      where: { status: JurisdictionStatus.ACTIVE },
      order: { type: 'ASC', name: 'ASC' },
    });

    const hierarchy: any = {};

    jurisdictions.forEach((jurisdiction) => {
      if (jurisdiction.type === JurisdictionType.COUNTRY) {
        hierarchy[jurisdiction.id] = {
          ...jurisdiction,
          children: [],
        };
      }
    });

    jurisdictions.forEach((jurisdiction) => {
      if (
        jurisdiction.type !== JurisdictionType.COUNTRY &&
        jurisdiction.parentId
      ) {
        const parent = hierarchy[jurisdiction.parentId];
        if (parent) {
          if (!parent.children) {
            parent.children = [];
          }
          parent.children.push(jurisdiction);
        }
      }
    });

    return Object.values(hierarchy);
  }

  async getNearbyJurisdictions(
    latitude: number,
    longitude: number,
    radiusKm: number = 50,
  ) {
    const jurisdictions = await this.jurisdictionRepository
      .createQueryBuilder('jurisdiction')
      .where('jurisdiction.status = :status', {
        status: JurisdictionStatus.ACTIVE,
      })
      .andWhere('jurisdiction.latitude IS NOT NULL')
      .andWhere('jurisdiction.longitude IS NOT NULL')
      .getMany();

    const nearbyJurisdictions = jurisdictions.filter((jurisdiction) => {
      const distance = this.calculateDistance(
        latitude,
        longitude,
        jurisdiction.latitude,
        jurisdiction.longitude,
      );
      return distance <= radiusKm;
    });

    return nearbyJurisdictions.sort((a, b) => {
      const distanceA = this.calculateDistance(
        latitude,
        longitude,
        a.latitude,
        a.longitude,
      );
      const distanceB = this.calculateDistance(
        latitude,
        longitude,
        b.latitude,
        b.longitude,
      );
      return distanceA - distanceB;
    });
  }

  async searchJurisdictions(query: string, type?: JurisdictionType) {
    const where: any = { status: JurisdictionStatus.ACTIVE };
    if (type) {
      where.type = type;
    }

    return this.jurisdictionRepository
      .createQueryBuilder('jurisdiction')
      .where('jurisdiction.status = :status', {
        status: JurisdictionStatus.ACTIVE,
      })
      .andWhere(
        '(jurisdiction.name ILIKE :query OR jurisdiction.code ILIKE :query)',
        { query: `%${query}%` },
      )
      .andWhere(type ? 'jurisdiction.type = :type' : '1=1', { type })
      .orderBy('jurisdiction.name', 'ASC')
      .getMany();
  }

  async updateLawyerCount(jurisdictionId: string, increment: boolean = true) {
    const jurisdiction = await this.findById(jurisdictionId);

    if (increment) {
      jurisdiction.lawyerCount += 1;
    } else if (jurisdiction.lawyerCount > 0) {
      jurisdiction.lawyerCount -= 1;
    }

    return this.jurisdictionRepository.save(jurisdiction);
  }

  async updateCaseCount(jurisdictionId: string, increment: boolean = true) {
    const jurisdiction = await this.findById(jurisdictionId);

    if (increment) {
      jurisdiction.caseCount += 1;
    } else if (jurisdiction.caseCount > 0) {
      jurisdiction.caseCount -= 1;
    }

    return this.jurisdictionRepository.save(jurisdiction);
  }

  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371;
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
        Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}
